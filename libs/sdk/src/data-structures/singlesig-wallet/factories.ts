import { makeObservable, observable } from "mobx";

import { SinglesigWallet } from "./implementation";
import { SinglesigWalletInterface } from "./interface";
import { SinglesigWalletSchema } from "./schema";
import { AbstractMigratable } from "../migratable";

export function createSinglesigWallet(
  migratable: AbstractMigratable<typeof SinglesigWalletSchema>
): SinglesigWalletInterface {
  const serialized = SinglesigWalletSchema.migratableSchema.parse(migratable);
  return new SinglesigWallet({
    publicKey: serialized.publicKey,
    privateKey: serialized.privateKey,
  });
}

export function createObservableSinglesigWallet(
  migratable: AbstractMigratable<typeof SinglesigWalletSchema>
): SinglesigWalletInterface {
  const wallet = createSinglesigWallet(migratable);
  makeObservable<SinglesigWalletInterface, "_keyPair">(
    wallet,
    {
      _keyPair: observable,
    },
    { name: "SinglesigWallet" }
  );
  return wallet;
}
