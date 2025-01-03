import { createMpcWallet, createObservableMpcWallet } from "./factories";
import { MpcWallet as MpcWalletInterface } from "./implementation";
import { MpcWalletSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export {
  BackedUpMpcWalletSchema,
  LocalMpcWalletSchema,
  UserEntryAddress,
  WalletData,
  LegacyMpcWalletSchema,
  MpcWalletSchema,
  EncryptedEasyShareForClient,
  EncryptedEasyShareForBackup,
  EncryptedBackupShare,
  EncryptedNetworkShare,
} from "./schema";

export type MpcWallet = MpcWalletInterface;

export const MpcWallet = {
  schema: MpcWalletSchema,
  create: createMpcWallet,
} satisfies AbstractDataStructure<MpcWallet, typeof MpcWalletSchema>;

export const ObservableMpcWallet = {
  schema: MpcWalletSchema,
  create: createObservableMpcWallet,
} satisfies AbstractDataStructure<MpcWallet, typeof MpcWalletSchema>;
