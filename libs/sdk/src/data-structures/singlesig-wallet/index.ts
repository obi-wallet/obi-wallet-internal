import {
  createObservableSinglesigWallet,
  createSinglesigWallet,
} from "./factories";
import { SinglesigWallet as SinglesigWalletInterface } from "./implementation";
import { SinglesigWalletSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export type SinglesigWallet = SinglesigWalletInterface;

export const SinglesigWallet = {
  schema: SinglesigWalletSchema,
  create: createSinglesigWallet,
} satisfies AbstractDataStructure<
  SinglesigWallet,
  typeof SinglesigWalletSchema
>;

export const ObservableSinglesigWallet = {
  schema: SinglesigWalletSchema,
  create: createObservableSinglesigWallet,
} satisfies AbstractDataStructure<
  SinglesigWallet,
  typeof SinglesigWalletSchema
>;
