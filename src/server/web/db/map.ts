import { MAP_WORLD_KEY } from "@/server/map/world";
// import { fetchTileIndex } from "@/server/shared/map/indices";
import type { BDB } from "@/server/shared/storage";
import { dedupeNearbyPhotos, recentFeedPosts } from "@/server/web/db/social";
import { fetchWorldMapByWorldKey } from "@/server/web/db/world_map";
// import { absoluteBucketURL } from "@/server/web/util/urls";
// import { adminImageURL } from "@/shared/map/paths";
// import { decodeTileMap } from "@/shared/map/serde";
import type { MapSocialData } from "@/shared/types";

const defaultData = {
  id: "alpha",
  version: 16103,
  cloudBucket: "biomes-static",
  webPFullKey: "world-map/prod/1683557644888/total_world_map.webp",
  fullImageWidth: 4096,
  webPFullWidth: 4096,
  fullImageHeight: 4096,
  webPFullHeight: 4096,
  updatedAt: 1701192968,
  boundsStart: [-2048, -2048],
  boundsEnd: [2048, 2048],
  tileMaxZoomLevel: 3,
  tileMinZoomLevel: -2,
  fullImageURL: "https://static.biomes.gg/map/tiles/admin?version=1693280833",
  fullTileImageURL:
    "https://static.biomes.gg/world-map/prod/1683557644888/total_world_map_tile.webp",
  tileImageTemplateURL:
    "https://static.biomes.gg/world-map/prod/1683557644888/tiles/{z}/{x}/{y}.webp",
  tileSize: 512,
  versionIndex: {
    "fog/0_23_-64": 1690170246,
    "surface/0_21_-63": 1690170246,
    "surface/0_22_-64": 1690170246,
    "fog/0_21_-64": 1690170246,
    "fog/2_5_-16": 1690171477,
    "surface/0_19_-61": 1690170246,
    "surface/2_5_-16": 1690171477,
    "fog/1_10_-32": 1690170246,
    "surface/1_10_-32": 1690170246,
    "fog/0_20_-64": 1690170246,
    "surface/0_20_-64": 1690170246,
    "surface/0_21_-64": 1690170246,
    "fog/0_19_-61": 1690170246,
    "fog/0_18_-61": 1690170184,
    "surface/0_18_-61": 1690170184,
    "surface/0_19_-62": 1690170184,
    "surface/0_18_-62": 1690170184,
    "surface/0_17_-61": 1690170184,
    "fog/0_17_-61": 1690170184,
    "surface/1_9_-31": 1690170246,
    "fog/0_19_-62": 1690170184,
    "fog/0_18_-62": 1690170184,
    "fog/1_9_-31": 1690170246,
    "fog/0_16_-61": 1690170184,
    "fog/0_17_-62": 1690170184,
    "fog/0_19_-63": 1690170184,
    "surface/0_16_-62": 1690170184,
    "surface/1_8_-31": 1690170184,
    "surface/0_16_-61": 1690170184,
    "fog/0_16_-62": 1690170184,
    "fog/1_8_-31": 1690170184,
    "surface/0_19_-63": 1690170184,
    "surface/0_17_-62": 1690170184,
    "fog/1_9_-32": 1690170184,
    "fog/0_18_-63": 1690170184,
    "fog/0_18_-64": 1690170184,
    "fog/0_19_-64": 1690170184,
    "surface/0_17_-63": 1690166369,
    "fog/0_17_-63": 1690166369,
    "surface/0_19_-64": 1690170184,
    "surface/0_18_-64": 1690170184,
    "surface/1_9_-32": 1690170184,
    "surface/0_18_-63": 1690170184,
    "surface/0_16_-63": 1690166369,
    "fog/1_8_-32": 1690166369,
    "surface/1_8_-32": 1690166369,
    "surface/0_17_-64": 1690166369,
    "fog/0_17_-64": 1690166369,
    "fog/0_16_-63": 1690166369,
    "surface/2_4_-16": 1690170246,
    "fog/0_16_-64": 1690166308,
    "surface/0_16_-64": 1690166308,
    "fog/2_4_-16": 1690170246,
    "surface/1_7_-29": 1690881010,
    "fog/0_14_-57": 1690881010,
    "fog/0_15_-58": 1690163530,
    "surface/6_-1_0": 1693270276,
    "surface/5_-1_1": 1693243099,
    "fog/6_-1_0": 1693270276,
    "fog/5_-2_-1": 1693146979,
    "surface/5_-2_-1": 1693146979,
    "surface/5_-2_-2": 1692732669,
    "fog/5_-2_-2": 1692732669,
    "surface/6_-1_-1": 1693280647,
    "fog/6_-1_-1": 1693280647,
    "admin": 1693280833
  }
};

export type MapTileMetadata = NonNullable<
  Awaited<ReturnType<typeof fetchTileMetadata>>
>;

export async function fetchTileMetadata(db: BDB) {
  let lastGeneratedData: any = await fetchWorldMapByWorldKey(db, MAP_WORLD_KEY);
  if (!lastGeneratedData) {
    lastGeneratedData = defaultData;
  }
  const data = {
    ...lastGeneratedData,
    ...CONFIG.overrideMapMetadata,
  };
  // Fetch the tile indices.
  // const versionIndex = await (async () => {
  //   const index = await fetchTileIndex(db, "versions");
  //   if (index) {
  //     const decoded = await decodeTileMap(index.blob);
  //     return Object.fromEntries(
  //       Array.from(decoded, ([k, v]) => [k, parseInt(v)])
  //     );
  //   } else {
  //     return {};
  //   }
  // })();

  return {
    id: MAP_WORLD_KEY,
    version: String(data.version),
    fullImageURL: defaultData.fullImageURL,
    fullImageWidth: data.webPFullWidth,
    fullImageHeight: data.webPFullHeight,
    fullTileImageURL: defaultData.fullTileImageURL,
    boundsStart: data.boundsStart,
    boundsEnd: data.boundsEnd,

    tileImageTemplateURL: defaultData.tileImageTemplateURL,
    tileMaxZoomLevel: data.tileMaxZoomLevel,
    tileMinZoomLevel: data.tileMinZoomLevel,
    tileSize: data.tileSize,
    versionIndex: defaultData.versionIndex,
  };
}

export async function fetchSocialMetadata(db: BDB) {
  const recentPosts = await recentFeedPosts(db);
  const deduped = dedupeNearbyPhotos(
    recentPosts,
    CONFIG.mapServerPhotoMinDistance,
    CONFIG.mapServerPhotoNumToCalculate
  );

  // TODO: clean this up once we decide on the photo units we want
  const baseSocialData: MapSocialData = {
    recentPhotoPositions: deduped
      .filter((e) => e.media?.length && e.media[0].metadata?.coordinates)
      .map((e) => [e.id, e.media![0].metadata!.coordinates]),
  };

  return baseSocialData;
}
