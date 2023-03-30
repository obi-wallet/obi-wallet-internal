import { makeObservable, observable } from "mobx";

import { SinglesigWallet } from "./implementation";
import { SinglesigWalletSchema } from "./schema";
import { AbstractMigratable } from "../migratable";

export function createSinglesigWallet(
  migratable: AbstractMigratable<typeof SinglesigWalletSchema>
) {
  const serialized = SinglesigWalletSchema.migratableSchema.parse(migratable);
  return new SinglesigWallet({
    publicKey: serialized.publicKey,
    privateKey: serialized.privateKey,
  });
}

export function createObservableSinglesigWallet(
  migratable: AbstractMigratable<typeof SinglesigWalletSchema>
) {
  const wallet = createSinglesigWallet(migratable);
  makeObservable<SinglesigWallet, "_keyPair">(
    wallet,
    {
      _keyPair: observable,
    },
    { name: "SinglesigWallet" }
  );
  return wallet;
}
