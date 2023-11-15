import { log } from "@/shared/logging";
import { Timer } from "@/shared/metrics/timer";
import { ok } from "assert";
import { entries, keys, mapValues, reverse, valuesIn, zipObject } from "lodash";

/*

This TypeScript file is a sophisticated implementation of a registry loader and builder system, designed to manage dependencies and
the lifecycle of various components in an application. Here's a detailed breakdown of its functionality:

1. **Imports and Dependencies**: The file imports several utilities like `log` for logging, `Timer` for tracking execution time, and
      functions from `lodash`. It also uses TypeScript's type system extensively for type safety and clarity.

2. **Factory and Factories Types**: Defines generic types for factory functions. A factory function is responsible for creating instances
      of a particular type. `Factories` is a mapping of these factory functions.

3. **Timing Type**: A generic type representing the timing information of different components in the registry.

4. **Scope Class**: Manages dependency scopes to prevent circular dependencies. It uses a set to track the current loading context and
      provides a method to create a new scope (`fork`) for nested dependencies.

5. **RegistryLoader Class**: The core class responsible for loading and managing components. It supports lazy loading of components, tracks
      the total time taken for loading, and handles optional dependencies. Key methods include:
    - `get`: To fetch a required component.
    - `getOptional`: To fetch an optional component.
    - `getAll`: To load multiple components simultaneously.
    - `build`: Finalizes the loading process and calculates load times.

6. **Memoize Function**: A utility function for memoizing factory functions. It ensures that a component is only created once and subsequent requests return the same instance.

7. **maybeSlowlog Function**: A diagnostic function to log slow-loading components. It checks the load times of components and logs them if they exceed certain thresholds.

8. **WithStop Type**: An extended type that adds a `stop` method to a component. This method is intended for clean-up operations when the component is no longer needed.

9. **RegistryBuilder Class**: A builder class for setting up and configuring the registry. It allows for binding components to factory functions, setting up components to be
      loaded early, and assembling the entire registry. It provides methods like `bind`, `loadEarly`, and `build` to configure and create a `RegistryLoader` instance.

10. **Lifecycle Management**: The `RegistryBuilder` and `RegistryLoader` classes together provide a robust system for managing the lifecycle of components. They handle
      creation, initialization, and teardown in a controlled manner.

11. **Flexibility and Reusability**: The use of generics and TypeScript's advanced type system makes this implementation highly reusable and adaptable to different types of
      contexts and components.

In summary, this file is a complex yet flexible solution for managing dependencies and lifecycle in a TypeScript application, leveraging advanced features of the TypeScript
language to ensure type safety and efficient component management.

*/

type Factory<Key extends keyof Context, Context> = (
  loader: RegistryLoader<Context>
) => Promise<Context[Key]>;

type Factories<Context> = { [Key in keyof Context]: Factory<Key, Context> };

export type Timing<Context> = { [Key in keyof Context]?: number };

class Scope<Context> {
  private readonly stack = new Set<keyof Context>();

  fork(key: keyof Context) {
    ok(!this.stack.has(key), "Circular dependency detected");

    const scope = new Scope<Context>();
    scope.stack.add(key);
    for (const key of this.stack) {
      scope.stack.add(key);
    }
    return scope;
  }

  toString() {
    return Array.from(this.stack).join(" -> ");
  }
}

export class RegistryLoader<Context> {
  private readonly partial: Partial<Context>;
  public totalTimeInThisLoader = 0;
  public loaded: boolean = false;

  constructor(
    private readonly scope: Scope<Context>,
    private readonly factories: Factories<Context>,
    public readonly timing: Timing<Context>,
    baseContext?: Partial<Context>
  ) {
    this.partial = baseContext ?? {};
  }

  get context(): Context | undefined {
    if (this.loaded) {
      return this.partial as Context;
    }
  }

  provide<A extends any[], R>(fn: (ctx: Context, ...args: A) => R) {
    return (...args: A) => {
      return fn(this.partial as Context, ...args);
    };
  }

  async getAll<Keys extends (keyof Context)[]>(
    ...keys: [...Keys]
  ): Promise<{
    [L in Keys[number]]: Context[L];
  }> {
    const vals = await Promise.all(keys.map((e) => this.get(e)));
    return zipObject(keys, vals) as any;
  }

  async getOptional<Key extends keyof Context>(
    key: Key
  ): Promise<Context[Key] | undefined> {
    if (this.partial[key] === undefined && !this.factories[key]) {
      return undefined;
    }
    try {
      if (this.partial[key] === undefined) {
        const timer = new Timer();
        this.timing[key] = -1;
        const childLoader = new RegistryLoader(
          this.scope.fork(key),
          this.factories,
          this.timing,
          this.partial
        );
        this.partial[key] = await this.factories[key](childLoader);
        const delta = timer.elapsed;
        this.timing[key] = Math.max(
          0,
          delta - childLoader.totalTimeInThisLoader
        );
        this.totalTimeInThisLoader += delta;
      }
      return this.partial[key]! as Context[Key];
    } catch (error) {
      log.error(`Error loading '${String(key)}'`, {
        error,
        scope: this.scope.toString(),
      });
      throw error;
    }
  }

  async get<Key extends keyof Context>(key: Key): Promise<Context[Key]> {
    const val = await this.getOptional(key);
    ok(
      this.factories[key] || val !== undefined,
      `Attempt to load unbound: "${String(key)}"`
    );
    return val!;
  }

  toJSON() {
    return {
      loaded: this.loaded,
      timing: this.timing,
    };
  }

  async build(): Promise<Context> {
    const timer = new Timer();
    if (!this.loaded) {
      await this.getAll(...(keys(this.factories) as (keyof Context)[]));
      this.loaded = true;
    }
    maybeSlowlog(this.timing, timer.elapsed);
    return this.context!;
  }
}

function memoize<Key extends keyof Context, Context>(
  factory: Factory<Key, Context>
) {
  let memo: Promise<Context[Key]> | undefined;
  return (loader: RegistryLoader<Context>) => {
    if (memo === undefined) {
      memo = Promise.resolve(factory(loader));
    }
    return memo;
  };
}

function maybeSlowlog<Context>(timing: Timing<Context>, total: number) {
  let slowKey = false;
  for (const time of valuesIn(timing)) {
    if (typeof time !== "number") {
      continue;
    }
    if (time > 50) {
      slowKey = true;
    }
  }
  if (slowKey || total > 1000) {
    log.info(`Slow registry load, took ${Math.floor(total)}ms`, {
      timing: mapValues(timing, (time) =>
        typeof time === "number" ? `${time.toFixed(3)}ms` : undefined
      ),
    });
  }
}

export type WithStop<T> = T & { stop(): Promise<void> };

export class RegistryBuilder<Context extends {}> {
  private readonly factories: Partial<Factories<Context>> = {};
  private readonly keysToLoadFirst: Array<keyof Context> = [];

  bind<Key extends keyof Context>(
    key: Key,
    factory: Factory<Key, Context>
  ): RegistryBuilder<Context> {
    this.factories[key] = memoize(factory);
    return this;
  }

  // Load early components will be before others, and should minimize
  // dependencies as it will also pull them earlier.
  loadEarly<Key extends keyof Context>(key: Key): RegistryBuilder<Context> {
    this.keysToLoadFirst.push(key);
    return this;
  }

  set<Key extends keyof Context>(
    key: Key,
    val: Context[Key]
  ): RegistryBuilder<Context> {
    return this.bind(key, () => Promise.resolve(val));
  }

  install(fn: (builder: RegistryBuilder<Context>) => void) {
    fn(this);
    return this;
  }

  buildLoader<BaseContext extends Partial<Context>>(
    derivedFrom?: BaseContext
  ): RegistryLoader<Context> {
    const ret: Partial<Context> = derivedFrom ?? {};
    return new RegistryLoader<Context>(
      new Scope(),
      this.factories as Factories<Context>,
      {},
      ret
    );
  }

  async build<BaseContext extends Partial<Context>>(
    derivedFrom?: BaseContext
  ): Promise<WithStop<Context>> {
    const loader = this.buildLoader(derivedFrom);
    for (const key of this.keysToLoadFirst) {
      await loader.get(key);
    }
    const ret = await loader.build();
    (ret as any).stop = async () => {
      // Note, we use 'reverse' here to ensure we stop things
      // in the opposite of insertion order (ie. generation order).
      for (const [key, value] of reverse(entries(ret))) {
        if (
          !value ||
          typeof value !== "object" ||
          !("stop" in value) ||
          typeof value.stop !== "function"
        ) {
          continue;
        }
        try {
          await value.stop();
        } catch (error) {
          log.error(`Error stopping '${key}'`, { error });
        }
      }
    };
    return ret as WithStop<Context>;
  }
}
