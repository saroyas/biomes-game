import { keys } from "lodash";
import { z } from "zod";

export const zAclAction = z.enum([
  "shape",
  "place",
  "destroy",
  "interact",
  "administrate",
  "createGroup",
  "dump",
  "tillSoil",
  "plantSeed",
  "pvp",
  "warp_from",
  "apply_buffs",
  "placeRobot",
  "placeCampsite",
  "placeEphemeral",
  "demuckerWand",
]);

export type AclAction = z.infer<typeof zAclAction>;

export const ALL_ACTIONS = new Set<AclAction>(
  keys(zAclAction.enum) as AclAction[]
);

export function isAclAction(value: unknown): value is AclAction {
  return ALL_ACTIONS.has(value as AclAction);
}

export const ALL_SPECIAL_ROLES = [
  // Can modify national parks.
  "groundskeeper",
] as const;

export const zSpecialRoles = z.enum([
  ...ALL_SPECIAL_ROLES,
]);

export type SpecialRoles = z.infer<typeof zSpecialRoles>;
