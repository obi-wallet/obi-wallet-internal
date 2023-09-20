import { action, makeObservable, observable } from "mobx";

import { MultisigWallet } from "./implementation";
import { MultisigWalletSchema } from "./schema";
import {
  createGatekeeperConfig,
  createObservableGatekeeperConfig,
} from "../gatekeeper-config";
import { AbstractMigratable } from "../migratable";
import { MultisigKey, ObservableMultisigKey } from "../multisig-key";
import {
  ObservableSinglesigWallet,
  SinglesigWallet,
} from "../singlesig-wallet";

export function createMultisigWallet(
  migratable: AbstractMigratable<typeof MultisigWalletSchema>,
  factories = {
    MultisigKey,
    SinglesigWallet,
    createGatekeeperConfig,
  },
) {
  const serialized = MultisigWalletSchema.migratableSchema.parse(migratable);
  return new MultisigWallet(
    serialized.data.chain,
    factories.MultisigKey.create(
      undefined,
      serialized.data.chain,
      serialized.data.owner
    ),
    serialized.data.proxyAddress.address,
    "", // evm addresses currently added manually
    "",
    factories.createGatekeeperConfig(serialized.data.gatekeeperConfig),
    serialized.data.singlesigWallets.map((s) => SinglesigWallet.create(s)),
    serialized.data.currentAccount,
    serialized.type === "multisig-demo",
  );
}

export function createObservableMultisigWallet(
  serialized: AbstractMigratable<typeof MultisigWalletSchema>,
) {
  const wallet = createMultisigWallet(serialized, {
    MultisigKey: ObservableMultisigKey,
    SinglesigWallet: ObservableSinglesigWallet,
    createGatekeeperConfig: createObservableGatekeeperConfig,
  });
  makeObservable<
    MultisigWallet,
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
      setCurrentAccountByMeta: action,
      setGatekeeperConfig: action,
      upsertSinglesigWallet: action,
      removeSinglesigWallet: action,
    },
    {
      name: "MultisigWallet",
    },
  );
  return wallet;
}
