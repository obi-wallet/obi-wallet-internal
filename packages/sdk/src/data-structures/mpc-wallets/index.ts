import { createMpcWallets, createObservableMpcWallets } from "./factories";
import { MpcWallets as MpcWalletsInterface } from "./implementation";
import { MpcWalletsSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export { LegacyMpcWalletsSchema, MpcWalletsSchema } from "./schema";

export type MpcWallets = MpcWalletsInterface;

export const MpcWallets = {
  schema: MpcWalletsSchema,
  create: createMpcWallets,
} satisfies AbstractDataStructure<MpcWallets, typeof MpcWalletsSchema>;

export const ObservableMpcWallets = {
  schema: MpcWalletsSchema,
  create: createObservableMpcWallets,
} satisfies AbstractDataStructure<MpcWallets, typeof MpcWalletsSchema>;
