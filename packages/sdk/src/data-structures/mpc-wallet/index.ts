import { createMpcWallet, createObservableMpcWallet } from "./factories";
import { MpcWallet as MpcWalletInterface } from "./implementation";
import { LegacyMpcWalletSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export {
  UserEntryAddress,
  WalletData,
  LegacyMpcWalletSchema,
  MpcWalletSchema,
} from "./schema";

export type MpcWallet = MpcWalletInterface;

export const MpcWallet = {
  schema: LegacyMpcWalletSchema,
  create: createMpcWallet,
} satisfies AbstractDataStructure<MpcWallet, typeof LegacyMpcWalletSchema>;

export const ObservableMpcWallet = {
  schema: LegacyMpcWalletSchema,
  create: createObservableMpcWallet,
} satisfies AbstractDataStructure<MpcWallet, typeof LegacyMpcWalletSchema>;
