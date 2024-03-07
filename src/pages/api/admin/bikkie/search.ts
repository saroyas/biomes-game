import type { BikkieSearchResult } from "@/client/components/admin/bikkie/requests";
import {
  zBikkieSearchRequest,
  zBikkieSearchResult,
} from "@/client/components/admin/bikkie/requests";
import {
  bakedToListed,
  matchesQuery,
  parseQuery,
} from "@/client/components/admin/bikkie/search";
import type { BiscuitState } from "@/client/components/admin/bikkie/unsaved";
import { UnsavedBiscuit } from "@/client/components/admin/bikkie/unsaved";
import { biomesApiHandler } from "@/server/web/util/api_middleware";
import { BikkieRuntime } from "@/shared/bikkie/active";
import { conformsWith } from "@/shared/bikkie/core";
import type { Biscuit } from "@/shared/bikkie/schema/attributes";
import { bikkie } from "@/shared/bikkie/schema/biomes";
import type { BiomesId } from "@/shared/ids";
import { log } from "@/shared/logging";

function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default biomesApiHandler(
  {
    auth: "optional",
    body: zBikkieSearchRequest,
    response: zBikkieSearchResult.array(),
  },
  async ({
    context: { bakery },
    body: { id: searchId, query: rawQuery, schemaPath },
  }) => {
    const query = rawQuery?.trim();
    const schema = bikkie.getSchema(schemaPath);
    const [nameList, tray] = await Promise.all([
      bakery.allNames(),
      bakery.getActiveTray(),
    ]);
    // log.info(`nameList: ${JSON.stringify(nameList)}`);
    // log.info(`tray: ${JSON.stringify(tray)}`);
    const trayDefinitions = tray.prepare();
    for (const biomeId of trayDefinitions.keys()) {
      log.info(`ID : ${biomeId.toString()}`);
      log.info(tray.has(biomeId).toString());
    }

    // Function to generate a random string of length 10
    function generateRandomString(length: number): string {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return result;
    }

    // Assuming trayDefinitions is accessible and correctly instantiated
    const renames: [BiomesId, string][] = Array.from(
      trayDefinitions.keys()
    ).map((id) => [id, generateRandomString(10)]);

    // Now you can use `renames` as the argument for `renameBiscuits`
    await bakery.renameBiscuits(...renames);

    const allNames = new Map(nameList);

    const getBakedBiscuit = (id: BiomesId): Biscuit | undefined => {
      const latestName = allNames.get(id);
      if (!latestName) {
        return;
      }
      const def = tray.get(id);
      if (!def) {
        return;
      }
      const synthetic = new UnsavedBiscuit(id, "", <BiscuitState>{
        name: latestName,
        extendedFrom: def.extendedFrom,
        attributes: def.attributes,
      }).bake();
      let baked = BikkieRuntime.get().getBiscuitOnlyIfExists(id);
      if (!baked) {
        // The biscuit exists, but hasn't been baked yet. Just use
        // the synthetic.
        return synthetic;
      }
      if (baked.name !== latestName) {
        baked = {
          ...baked,
          name: latestName,
        };
      }
      if (baked.displayName !== synthetic.displayName) {
        baked = {
          ...baked,
          displayName: synthetic.displayName,
        };
      }
      return baked;
    };

    const prepared = parseQuery(query);

    // Short-circuit ID lookup.
    if (searchId !== undefined) {
      const baked = getBakedBiscuit(searchId);
      if (!baked || !matchesQuery(baked, prepared)) {
        return [];
      }
      if (!baked || !conformsWith(schema, baked)) {
        return [];
      }
      return [bakedToListed(baked)];
    }

    // Full search.
    const matches: BikkieSearchResult[] = [];
    for (const id of allNames.keys()) {
      const baked = getBakedBiscuit(id);
      if (!baked || !matchesQuery(baked, prepared)) {
        continue;
      }
      if (!conformsWith(schema, baked)) {
        continue;
      }
      matches.push(bakedToListed(baked));
    }
    return matches;
  }
);
