import { action, makeObservable, observable, toJS } from "mobx";
import * as R from "ramda";

import { Wallets } from "./implementation";
import { WalletsSchema } from "./schema";
import { AbstractMigratable } from "../migratable";
import { MultisigWallet, ObservableMultisigWallet } from "../multisig-wallet";

export function createWallets(
  migratable: AbstractMigratable<typeof WalletsSchema> = {
    wallets: [],
    currentWalletIndex: null,
  },
  factory = MultisigWallet,
  serialize = R.identity
) {
  const serialized = WalletsSchema.migratableSchema.parse(migratable);
  return new Wallets(
    serialized.wallets.map((wallet) => factory.create(wallet)),
    serialized.currentChainId,
    serialized.currentWalletIndexPerChain,
    factory,
    serialize
  );
}

export function createObservableWallets(
  migratable?: AbstractMigratable<typeof WalletsSchema>
) {
  const wallets = createWallets(migratable, ObservableMultisigWallet, toJS);
  makeObservable<
    Wallets,
    "_wallets" | "_currentChainId" | "_currentWalletIndexPerChain"
  >(
    wallets,
    {
      _wallets: observable,
      _currentChainId: observable,
      _currentWalletIndexPerChain: observable,
      deserialize: action,
      toJSON: false,
      setCurrentChain: action,
      setCurrentWallet: action,
      logout: action,
      upsertWallet: action,
      removeWallet: action,
    },
    {
      name: "Wallets",
    }
  );
  return wallets;
}
