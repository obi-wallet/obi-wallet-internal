import {
  createMultisigWallet,
  createObservableMultisigWallet,
} from "./factories";
import { MultisigWallet as MultisigWalletInterface } from "./implementation";
import { MultisigWalletSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export type { CurrentAccountMeta, WalletMeta } from "./implementation";

export type MultisigWallet = MultisigWalletInterface;

export const MultisigWallet = {
  schema: MultisigWalletSchema,
  create: createMultisigWallet,
} satisfies AbstractDataStructure<MultisigWallet, typeof MultisigWalletSchema>;

export const ObservableMultisigWallet = {
  schema: MultisigWalletSchema,
  create: createObservableMultisigWallet,
} satisfies AbstractDataStructure<MultisigWallet, typeof MultisigWalletSchema>;
