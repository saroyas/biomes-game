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

const printValue = (value) => {
    console.log('ID:', value.id);
    console.log('Version:', value.version);
    if (value.shard_seed?.buffer) {
      console.log('Shard Seed Buffer:', value.shard_seed.buffer);
    } else {
      console.log('Shard Seed Buffer: N/A');
    }
    console.log('Other Properties:', { ...value });
  };


// Function to compare backup files and log differences in value objects
export async function bootstrapRedis(
  originalBackup: string,
  latestBackup: string
) {
  if (!originalBackup || !latestBackup) {
    log.fatal(`Usage: node script.js <originalBackup> <latestBackup>`);
    return;
  }

  await scriptInit();

//   const storage = new RedisBikkieStorage(await connectToRedis("bikkie"));
//   if (process.env.SKIP_PROD_LOAD === "false") {
//     await loadTrayDefinitionFromProd(storage);
//     await storage.save(await loadBakedTrayFromProd());
//   }

  // Maps for storing ID to value object from each file
  const shardIdsOriginal = new Map();
  const shardIdsLatest = new Map();

  console.log("Processing original backup file...");
  // Loading and processing entries from the first backup file
  for await (const [version, value] of iterBackupEntriesFromFile(
    originalBackup
  )) {
    if (version === "bikkie") {
      // console.log("Using version 'bikkie' from original...");
      // const { definition, baked } = value;
      // await Promise.all([
      //   storage.saveDefinition(definition),
      //   storage.save(baked),
      // ]);
      // const result = await storage.getCurrentBakedTrayId();
      // console.log(`Saved in tray id ${result}`);
    } else {
      if (value.shard_seed?.buffer) {
        shardIdsOriginal.set(value.id.toString(), value);
      }
    }
  }

  // Loading and processing entries from the second backup file
  console.log("Loading world and processing latest backup file...");
  const changes: ProposedChange[] = [];
  for await (const [version, value] of iterBackupEntriesFromFile(
    latestBackup
  )) {
    if (version === "bikkie") {
      console.log("Processing version 'bikkie' from latest backup...");
      const { definition, baked } = value;
    //   await Promise.all([
    //     storage.saveDefinition(definition),
    //     storage.save(baked),
    //   ]);
    //   const result = await storage.getCurrentBakedTrayId();
    //   console.log(`Saved in tray id ${result}`);
    } else {
      changes.push({
        kind: "create",
        entity: value,
      });
      printValue(value);
      if (value.shard_seed?.buffer) {
        shardIdsLatest.set(value.id.toString(), value);
      }
    }
  }

  // console log the total shard counts
  console.log(`Original shard count: ${shardIdsOriginal.size}`);
  console.log(`Latest shard count: ${shardIdsLatest.size}`);

  // Determining missing values by comparing maps
//   const missingShardsInOriginal = [...shardIdsLatest.keys()]
//     .filter((id) => !shardIdsOriginal.has(id))
//     .map((id) => shardIdsLatest.get(id));
//   const missingShardsInLatest = [...shardIdsOriginal.keys()]
    // .filter((id) => !shardIdsLatest.has(id))
    // .map((id) => shardIdsOriginal.get(id));

  // console log the number of missing values
//   console.log(`Missing shards in original: ${missingShardsInOriginal.length}`);
//   console.log(`Missing shards in latest: ${missingShardsInLatest.length}`);

  // for each missing shard valuev (the value not the key) in latest, add to changes array
//   for (const shard of missingShardsInLatest) {
//     changes.push({
//       kind: "create",
//       entity: shard,
//     });
//   }
//   await storage.stop();

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

//   for (const batch of chunk(changes, CONFIG.redisMaxKeysPerBatch - 1)) {
//     await world.apply({ changes: batch });
//     processed += batch.length;
//     if (lastMessage.elapsed > 5000) {
//       printStatus();
//     }
//   }

  printStatus();
  await world.stop();
  console.log("Done!");
}

// Extract backup file paths from command line arguments
const [originalBackup, latestBackup] = process.argv.slice(2);
bootstrapRedis(originalBackup, latestBackup);
