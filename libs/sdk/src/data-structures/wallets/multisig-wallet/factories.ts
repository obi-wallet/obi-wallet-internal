import { action, makeObservable, observable } from "mobx";

import { MultisigWallet } from "./implementation";
import { MultisigWalletInterface } from "./interface";
import { MultisigWalletSchema } from "./schema";
import { AbstractMigratable } from "../../migratable";
import {
  createGatekeeperConfig,
  createObservableGatekeeperConfig,
} from "../gatekeeper-config";
import {
  createMultisigKey,
  createObservableMultisigKey,
} from "../multisig-key";

export function createMultisigWallet(
  migratable: AbstractMigratable<typeof MultisigWalletSchema>,
  factories = {
    createMultisigKey,
    createGatekeeperConfig,
  }
): MultisigWalletInterface {
  const serialized = MultisigWalletSchema.migratableSchema.parse(migratable);
  return new MultisigWallet(
    serialized.data.chain,
    factories.createMultisigKey(serialized.data.chain, serialized.data.owner),
    serialized.data.proxyAddress.address,
    factories.createGatekeeperConfig(serialized.data.gatekeeperConfig),
    serialized.data.singlesigWallets,
    serialized.data.currentAccount,
    serialized.type === "multisig-demo"
  );
}

export function createObservableMultisigWallet(
  serialized: AbstractMigratable<typeof MultisigWalletSchema>
): MultisigWalletInterface {
  const wallet = createMultisigWallet(serialized, {
    createMultisigKey: createObservableMultisigKey,
    createGatekeeperConfig: createObservableGatekeeperConfig,
  });
  makeObservable<
    MultisigWalletInterface,
    | "_chainId"
    | "_owner"
    | "_proxyAddress"
    | "_gatekeeperConfig"
    | "_singlesigWallets"
    | "_currentAccount"
    | "_isDemo"
  >(
    wallet,
    {
      _chainId: observable,
      _owner: observable,
      _proxyAddress: observable,
      _gatekeeperConfig: observable,
      _singlesigWallets: observable,
      _currentAccount: observable,
      _isDemo: observable,
      toJSON: false,
      setOwner: action,
      setCurrentAccount: action,
      setGatekeeperConfig: action,
    },
    {
      name: "MultisigWallet",
    }
  );
  return wallet;
}
