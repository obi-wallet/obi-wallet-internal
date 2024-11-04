import { action, makeObservable, observable, toJS } from "mobx";
import * as R from "ramda";
import { z } from "zod";

import { MpcWallets } from "./implementation";
import { MpcWalletsSchema } from "./schema";
import { MpcWallet, ObservableMpcWallet } from "../mpc-wallet";

export function createMpcWallets(
  serialized: z.infer<typeof MpcWalletsSchema> = {
    v: 1,
    wallets: [],
    currentWalletIndex: null,
  },
  factory = MpcWallet,
  serialize = R.identity,
) {
  // TODO: Filter out wallets without easy shares
  // const serialized = LegacyMpcWalletsSchema.migratableSchema.parse({
  //   ...migratable,
  //   wallets: migratable.wallets.filter((wallet) => {
  //     return !!wallet.encryptedShares.easy;
  //   }),
  // });
  return new MpcWallets(
    serialized.wallets.map((wallet) => {
      return factory.create(wallet);
    }),
    serialized.currentWalletIndex,
    factory,
    serialize,
  );
}

export function createObservableMpcWallets(
  serialized?: z.infer<typeof MpcWalletsSchema>,
) {
  const wallets = createMpcWallets(serialized, ObservableMpcWallet, toJS);
  makeObservable<MpcWallets, "_wallets" | "_currentWalletIndex">(
    wallets,
    {
      _wallets: observable,
      _currentWalletIndex: observable,
      deserialize: action,
      toJSON: false,
      setCurrentWallet: action,
      logout: action,
      upsertWallet: action,
      removeWallet: action,
    },
    {
      name: "MpcWallets",
    },
  );
  return wallets;
}
