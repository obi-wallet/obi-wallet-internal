import { action, makeObservable, observable } from "mobx";

import { MpcWallet } from "./implementation";
import { LegacyMpcWalletSchema } from "./schema";
import { AbstractMigratable } from "../migratable";
import { MultisigKey, ObservableMultisigKey } from "../multisig-key";

export function createMpcWallet(
  migratable: AbstractMigratable<typeof LegacyMpcWalletSchema>,
  factories = {
    MultisigKey,
  },
) {
  const serialized = LegacyMpcWalletSchema.migratableSchema.parse(migratable);
  return new MpcWallet(
    serialized.homeChain,
    factories.MultisigKey.create(serialized.homeChain, serialized.owner),
    serialized.userEntryAddress,
    serialized.encryptedShares,
    serialized.ed25519KeyPair,
    serialized.previousWalletData,
  );
}

export function createObservableMpcWallet(
  serialized: AbstractMigratable<typeof LegacyMpcWalletSchema>,
) {
  const wallet = createMpcWallet(serialized, {
    MultisigKey: ObservableMultisigKey,
  });
  makeObservable<
    MpcWallet,
    | "_homeChainId"
    | "_owner"
    | "_userEntryAddress"
    | "_encryptedShares"
    | "_ed25519KeyPair"
    | "_previousWalletData"
  >(
    wallet,
    {
      _homeChainId: observable,
      _owner: observable,
      _userEntryAddress: observable,
      _encryptedShares: observable,
      _ed25519KeyPair: observable,
      _previousWalletData: observable,
      setOwner: action,
      setEncryptedShares: action,
      setEd25519KeyPair: action,
      setPreviousWalletData: action,
      toJSON: false,
    },
    {
      name: "MpcWallet",
    },
  );
  return wallet;
}
