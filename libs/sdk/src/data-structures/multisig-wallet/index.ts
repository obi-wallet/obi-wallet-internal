import {
  createMultisigWallet,
  createObservableMultisigWallet,
} from "./factories";
import { MultisigWallet as MultisigWalletInterface } from "./implementation";
import { MultisigWalletSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export { CurrentAccountMeta, WalletMeta } from "./implementation";

export type MultisigWallet = MultisigWalletInterface;

export const MultisigWallet = {
  schema: MultisigWalletSchema,
  create: createMultisigWallet,
} satisfies AbstractDataStructure<MultisigWallet>;

export const ObservableMultisigWallet = {
  schema: MultisigWalletSchema,
  create: createObservableMultisigWallet,
} satisfies AbstractDataStructure<MultisigWallet>;
