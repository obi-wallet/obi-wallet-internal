import { action, makeObservable, observable } from "mobx";
import { z } from "zod";

import { MpcWallet } from "./implementation";
import { MpcWalletSchema } from "./schema";
import { MultisigKey, ObservableMultisigKey } from "../multisig-key";

export function createMpcWallet(
  serialized: z.infer<typeof MpcWalletSchema>,
  factories = {
    MultisigKey,
  },
) {
  return new MpcWallet(
    serialized.homeChain,
    factories.MultisigKey.create(serialized.homeChain, serialized.owner),
    serialized.userEntryAddress,
    serialized.encryptedShares,
    serialized.ed25519KeyPair,
    serialized.secp256k1KeyPair,
    serialized.previousWalletData,
  );
}

export function createObservableMpcWallet(
  serialized: z.infer<typeof MpcWalletSchema>,
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
    | "_secp256k1KeyPair"
    | "_previousWalletData"
  >(
    wallet,
    {
      _homeChainId: observable,
      _owner: observable,
      _userEntryAddress: observable,
      _encryptedShares: observable,
      _ed25519KeyPair: observable,
      _secp256k1KeyPair: observable,
      _previousWalletData: observable,
      setOwner: action,
      setEncryptedShares: action,
      setEd25519KeyPair: action,
      setSecp256k1KeyPair: action,
      setPreviousWalletData: action,
      toJSON: false,
    },
    {
      name: "MpcWallet",
    },
  );
  return wallet;
}
