import { iterBackupEntriesFromFile } from "@/server/backup/serde";
import {
  loadBakedTrayFromProd,
  loadTrayDefinitionFromProd,
} from "@/server/shared/bikkie/dev";
import { RedisBikkieStorage } from "@/server/shared/bikkie/storage/redis";
import {
  connectToRedis,
  connectToRedisWithLua,
} from "@/server/shared/redis/connection";
import { scriptInit } from "@/server/shared/script_init";
import { RedisWorld } from "@/server/shared/world/redis";
import { ProposedChange } from "@/shared/ecs/change";
import { log } from "@/shared/logging";
import { Timer, TimerNeverSet } from "@/shared/metrics/timer";
import { chunk } from "lodash";

/*

This script is a utility for initializing a Redis database with data from a backup file,
particularly handling specific data types and structures related to a system using the Entity Component System pattern.
It's designed to be run from the command line, expecting a backup file as an argument.

bootstrapRedis function: The main function of the script. It's an asynchronous function that takes an optional `backupFile` argument. It performs several tasks:
  Initialization: It starts with a check for the `backupFile`. If not present, it logs a fatal error and returns.
  Script Initialization: Calls `scriptInit()` for any required setup.
  Redis Storage Setup: Creates a `RedisBikkieStorage` instance by connecting to Redis.
  Loading Data from Production: If `SKIP_PROD_LOAD` is not set to "false", it loads tray definitions and baked trays from production into the storage.
  Loading Backup Data: The script iterates over entries from the backup file using `iterBackupEntriesFromFile`. It distinguishes between 'bikkie' type entries (which involve saving definitions and baked data) and other types, which are treated as changes to be applied.
  Redis World Initialization: It initializes `RedisWorld` for handling ECS (Entity Component System) data.
  Applying Changes: The script batches changes and applies them to the Redis world. It keeps track of the number of processed changes and prints the status periodically.

*/

export async function bootstrapRedis(backupFile?: string) {
  if (!backupFile) {
    log.fatal(`Usage: node bootstrap_redis.js <backup_file>`);
    return;
  }

  await scriptInit();

  const storage = new RedisBikkieStorage(await connectToRedis("bikkie"));
  if (process.env.SKIP_PROD_LOAD === "false") {
    await loadTrayDefinitionFromProd(storage);
    await storage.save(await loadBakedTrayFromProd());
  }

  console.log("Loading world...");
  const changes: ProposedChange[] = [];
  for await (const [version, value] of iterBackupEntriesFromFile(backupFile)) {
    if (version === "bikkie") {
      const { definition, baked } = value;
      await Promise.all([
        storage.saveDefinition(definition),
        storage.save(baked),
      ]);
      const result = await storage.getCurrentBakedTrayId();
      console.log(`Saved in tray id ${result}`);
    } else {
      changes.push({
        kind: "create",
        entity: value,
      });
    }
  }
  await storage.stop();

  console.log(`Loaded ${changes.length} changes, placing into redis.`);

  const world = new RedisWorld(await connectToRedisWithLua("ecs"));
  await world.waitForHealthy();

  const timer = new Timer();
  const lastMessage = new Timer(TimerNeverSet);
  let processed = 0;

  const printStatus = () => {
    console.log(
      `Processed ${processed} changes, at ${
        (processed / timer.elapsed) * 1000
      } changes/s`
    );
    lastMessage.reset();
  };

  for (const batch of chunk(changes, CONFIG.redisMaxKeysPerBatch - 1)) {
    await world.apply({ changes: batch });
    processed += batch.length;
    if (lastMessage.elapsed > 5000) {
      printStatus();
    }
  }

  printStatus();
  await world.stop();
  console.log("Done!");
}

const [backupFile] = process.argv.slice(2);
bootstrapRedis(backupFile);
