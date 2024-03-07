import { loadBikkieForScript } from "@/../scripts/node/helpers/bikkie";
import { createBiomesBakery } from "@/server/shared/bikkie/registry";
import { RedisBikkieStorage } from "@/server/shared/bikkie/storage/redis";
import { DbIdGenerator } from "@/server/shared/ids/generator";
import { connectToRedis } from "@/server/shared/redis/connection";
import { createBdb, createStorageBackend } from "@/server/shared/storage";
import { getBiscuits } from "@/shared/bikkie/active";
import { biscuitToJson } from "@/shared/bikkie/schema/attributes";
import {
  BiscuitAttributeAssignment,
  BiscuitDefinition,
} from "@/shared/bikkie/tray";
import { BiomesId } from "@/shared/ids";
import { log } from "@/shared/logging";
import { DefaultMap } from "@/shared/util/collections";

const LEGACY_HANDCRAFT = 1534621126189502 as BiomesId;

const NAVIGATION_AIDS_TO_DELETE: unknown[] = [
  "active_campsite",
  "plot",
  "deed",
];

async function fixItems() {
  // log.info("loading  bootstrapGlobalSecrets...");
  // await bootstrapGlobalSecrets("untrusted-apply-token");
  // log.info("loaded  bootstrapGlobalSecrets...");
  await loadBikkieForScript();

  const storage = await createStorageBackend("firestore");
  const db = createBdb(storage);
  const bikkieStorage = new RedisBikkieStorage(await connectToRedis("bikkie"));
  const idGenerator = new DbIdGenerator(db);
  const bakery = createBiomesBakery(db, bikkieStorage, [], idGenerator);

  const idMap = new DefaultMap<BiomesId, BiomesId>((key) => key);

  log.info("Migrating Biscuit definitions...");

  const definitions: BiscuitDefinition[] = [];
  for (const biscuit of getBiscuits()) {
    const assignment: Record<number, BiscuitAttributeAssignment> = {};
    const biscuit_json = biscuitToJson(biscuit, true);

    log.info(`Biscuit details jsonified ${JSON.stringify(biscuit_json)}`);
    log.info(`Read ${biscuit.name}`);
  }
}

fixItems();
