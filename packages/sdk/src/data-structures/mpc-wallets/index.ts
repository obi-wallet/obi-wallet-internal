import { createMpcWallets, createObservableMpcWallets } from "./factories";
import { MpcWallets as MpcWalletsInterface } from "./implementation";
import { LegacyMpcWalletsSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export { LegacyMpcWalletsSchema, MpcWalletsSchema } from "./schema";

export type MpcWallets = MpcWalletsInterface;

export const MpcWallets = {
  schema: LegacyMpcWalletsSchema,
  create: createMpcWallets,
} satisfies AbstractDataStructure<MpcWallets, typeof LegacyMpcWalletsSchema>;

export const ObservableMpcWallets = {
  schema: LegacyMpcWalletsSchema,
  create: createObservableMpcWallets,
} satisfies AbstractDataStructure<MpcWallets, typeof LegacyMpcWalletsSchema>;
