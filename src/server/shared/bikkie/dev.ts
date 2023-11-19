import type { BakedBiscuitTray } from "@/server/shared/bikkie/registry";
import type { BikkieStorage } from "@/server/shared/bikkie/storage/api";
import {
  fromStoredBakedTray,
  zStoredBakedTray,
} from "@/server/shared/bikkie/storage/baked";
import { parseEncodedTrayDefinition } from "@/server/shared/bikkie/storage/definition";
import type { BiscuitTray } from "@/shared/bikkie/tray";
import type { BiomesId } from "@/shared/ids";
import { INVALID_BIOMES_ID } from "@/shared/ids";
import { log } from "@/shared/logging";
import { typesafeJSONStringify } from "@/shared/util/helpers";
import { zrpcWebDeserialize, zrpcWebSerialize } from "@/shared/zrpc/serde";
import { ok } from "assert";

const DOMAIN = process.env.DOMAIN;

export async function loadTrayDefinitionFromProd(
  bikkieStorage: BikkieStorage,
  id?: BiomesId
): Promise<BiscuitTray> {
  // everyone is admin lol
  // const userId = await determineEmployeeUserId();
  // const authSessionId = SessionStore.createInternalSyncSession(userId).id;

  const response = await fetch(
    `${DOMAIN}/api/admin/bikkie/export_definition?id=${id ?? 0}`,
    {
      method: "POST",
      //    headers: {
      //      Cookie: serializeAuthCookies({
      //        userId,
      //        id: authSessionId,
      //      }),
      //    },
    }
  );
  const data = (await response.json()).z;
  const tray = await parseEncodedTrayDefinition(
    id ?? INVALID_BIOMES_ID,
    Buffer.from(data, "base64"),
    async (id) => {
      const tray = await loadTrayDefinitionFromProd(bikkieStorage, id);
      await bikkieStorage.saveDefinition(tray);
      return tray;
    }
  );
  ok(tray, "Could not read prod tray!");
  await bikkieStorage.saveDefinition(tray);
  return tray;
}

export async function loadBakedTrayFromProd(): Promise<BakedBiscuitTray> {
  // const userId = await determineEmployeeUserId();
  // const authSessionId = SessionStore.createInternalSyncSession(userId).id;

  const response = await fetch(`${DOMAIN}/api/admin/bikkie/export`, {
    method: "POST",
    //    headers: {
    //      Cookie: serializeAuthCookies({
    //        userId,
    //        id: authSessionId,
    //      }),
    //    },
  });
  const data = (await response.json()).z;
  const tray = fromStoredBakedTray(zrpcWebDeserialize(data, zStoredBakedTray));

  log.info("Loaded baked Biscuits from prod", {
    trayId: tray.id,
    numBiscuits: tray.contents.size,
  });
  return tray;
}

export async function triggerProdBake(notes: string): Promise<void> {
  // const userId = await determineEmployeeUserId();
  // const authSessionId = SessionStore.createInternalSyncSession(userId).id;
  const response = await fetch(`${DOMAIN}/api/admin/bikkie/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      //  Cookie: serializeAuthCookies({
      //    userId,
      //    id: authSessionId,
      //  }),
    },
    body: typesafeJSONStringify({
      z: zrpcWebSerialize({
        trayName: notes,
        updates: [],
      }),
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to trigger prod bake");
  }
}
