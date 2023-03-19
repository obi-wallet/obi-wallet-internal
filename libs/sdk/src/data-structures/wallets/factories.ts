import { action, makeObservable, observable } from "mobx";

import { Wallets } from "./implementation";
import { WalletsSchema } from "./schema";
import { AbstractMigratable } from "../migratable";
import { MultisigWallet, ObservableMultisigWallet } from "../multisig-wallet";

export function createWallets(
  migratable: AbstractMigratable<typeof WalletsSchema> = {
    wallets: [],
    currentWalletIndex: null,
  },
  factory = MultisigWallet
) {
  const serialized = WalletsSchema.migratableSchema.parse(migratable);
  return new Wallets(
    serialized.wallets.map((wallet) => factory.create(wallet)),
    serialized.currentWalletIndex,
    factory
  );
}

export function createObservableWallets(
  migratable?: AbstractMigratable<typeof WalletsSchema>
) {
  const wallets = createWallets(migratable, ObservableMultisigWallet);
  makeObservable<Wallets, "_wallets" | "_currentWalletIndex">(wallets, {
    _wallets: observable,
    _currentWalletIndex: observable,
    toJSON: false,
    setCurrentWallet: action,
    logout: action,
    upsertWallet: action,
    removeWallet: action,
  });
  return wallets;
}
