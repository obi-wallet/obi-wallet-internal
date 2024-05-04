import { action, makeObservable, observable, toJS } from "mobx";
import * as R from "ramda";

import { MpcWallets } from "./implementation";
import { MpcWalletsSchema } from "./schema";
import { AbstractMigratable } from "../migratable";
import { MpcWallet, ObservableMpcWallet } from "../mpc-wallet";

export function createMpcWallets(
  migratable: AbstractMigratable<typeof MpcWalletsSchema> = {
    wallets: [],
    currentWalletIndex: null,
  },
  factory = MpcWallet,
  serialize = R.identity,
) {
  const serialized = MpcWalletsSchema.migratableSchema.parse({
    ...migratable,
    // Filter out wallets without easy shares
    wallets: migratable.wallets.filter((wallet) => {
      return !!wallet.encryptedShares.easy;
    }),
  });
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
  migratable?: AbstractMigratable<typeof MpcWalletsSchema>,
) {
  const wallets = createMpcWallets(migratable, ObservableMpcWallet, toJS);
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
