import {
  createMultisigWallet,
  createObservableMultisigWallet,
} from "./factories";
import { MultisigWalletInterface } from "./interface";
import { MultisigWalletSchema, SinglesigWallet } from "./schema";
import { AbstractDataStructure } from "../../abstract";

export { SinglesigWallet };

export type MultisigWallet = MultisigWalletInterface;

export const MultisigWallet = {
  schema: MultisigWalletSchema,
  create: createMultisigWallet,
} satisfies AbstractDataStructure<MultisigWallet>;

export const ObservableMultisigWallet = {
  schema: MultisigWalletSchema,
  create: createObservableMultisigWallet,
} satisfies AbstractDataStructure<MultisigWallet>;
