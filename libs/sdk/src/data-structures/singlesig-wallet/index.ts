import {
  createSinglesigWallet,
  createObservableSinglesigWallet,
} from "./factories";
import { SinglesigWallet as SinglesigWalletInterface } from "./implementation";
import { SinglesigWalletSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export type SinglesigWallet = SinglesigWalletInterface;

export const SinglesigWallet = {
  schema: SinglesigWalletSchema,
  create: createSinglesigWallet,
} satisfies AbstractDataStructure<SinglesigWallet>;

export const ObservableSinglesigWallet = {
  schema: SinglesigWalletSchema,
  create: createObservableSinglesigWallet,
} satisfies AbstractDataStructure<SinglesigWallet>;
