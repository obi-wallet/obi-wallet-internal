import { createObservableWallets, createWallets } from "./factories";
import { Wallets as WalletsInterface } from "./implementation";
import { WalletsSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export type Wallets = WalletsInterface;

export const Wallets = {
  schema: WalletsSchema,
  create: createWallets,
} satisfies AbstractDataStructure<Wallets, typeof WalletsSchema>;

export const ObservableWallets = {
  schema: WalletsSchema,
  create: createObservableWallets,
} satisfies AbstractDataStructure<Wallets, typeof WalletsSchema>;
