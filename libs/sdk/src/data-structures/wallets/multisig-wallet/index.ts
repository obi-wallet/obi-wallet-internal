import { Bech32Address } from "@keplr-wallet/cosmos";
import { action, makeObservable, observable } from "mobx";

import {
  CurrentAccount,
  MultisigWalletSchema,
  SinglesigWallet,
} from "./schema";
import {
  Chain,
  CosmosChain,
  cosmosChains,
  TerraChain,
  terraChains,
} from "../../../chains";
import { Sdk } from "../../../sdk";
import { AbstractSerialized } from "../../abstract";
import {
  createGatekeeperConfig,
  createObservableGatekeeperConfig,
  GatekeeperConfig,
} from "../gatekeeper-config";
import { MultisigKey, ObservableMultisigKey } from "../multisig-key";

export { SinglesigWallet };

export class MultisigWallet<M extends MultisigKey = MultisigKey> {
  public static get schema() {
    return MultisigWalletSchema;
  }

  public constructor(
    protected _chainId: Chain,
    protected _owner: M,
    protected _proxyAddress: string,
    protected _gatekeeperConfig: GatekeeperConfig,
    protected _singlesigWallets: AbstractSerialized<typeof SinglesigWallet>[],
    protected _currentAccount: AbstractSerialized<typeof CurrentAccount> | null,
    protected _isDemo: boolean
  ) {}

  public toJSON(): AbstractSerialized<typeof MultisigWalletSchema> {
    return {
      type: this._isDemo ? "multisig-demo" : "multisig",
      data: {
        chain: this._chainId,
        owner: this._owner.toJSON(),
        proxyAddress: {
          v: 1,
          address: this._proxyAddress,
        },
        gatekeeperConfig: this._gatekeeperConfig.toJSON(),
        singlesigWallets: this._singlesigWallets,
        currentAccount: this._currentAccount,
      },
    };
  }

  public get id() {
    return this.proxyAddress;
  }

  public get meta() {
    return {
      walletId: this.id,
      currentAccount: this._currentAccount,
    };
  }

  public get chainId() {
    return this._chainId;
  }

  public get chain() {
    // TODO: move into SDK or a new Chain DS
    return Chain.select<
      (typeof terraChains)[TerraChain] | (typeof cosmosChains)[CosmosChain]
    >({
      chainId: this._chainId,
      onTerraChain(chainId) {
        return terraChains[chainId];
      },
      onCosmosChain(chainId) {
        return cosmosChains[chainId];
      },
    });
  }

  public get isDemo() {
    return this._isDemo;
  }

  public get proxyAddress() {
    return this._proxyAddress;
  }

  public get address() {
    if (this.currentAccount?.type === "singlesig-wallet") {
      return Sdk.chainId(this._chainId).getAddressOfPublicKey({
        publicKey: this.currentAccount.publicKey,
      });
    }

    return this._proxyAddress;
  }

  public get shortenedAddress(): string | null {
    const address = this.address;
    return address ? Bech32Address.shortenAddress(address, 20) : null;
  }

  public isOutdated(codeIds: {
    userAccount: number;
    spendLimitGatekeeper: number | null;
    debtGatekeeper: number | null;
  }) {
    // TODO: move into SDK
    return Chain.select({
      chainId: this._chainId,
      onTerraChain(chainId) {
        return (
          codeIds.userAccount <
            terraChains[chainId].currentCodeIds.userAccount ||
          codeIds.spendLimitGatekeeper === null ||
          codeIds.spendLimitGatekeeper <
            terraChains[chainId].currentCodeIds.spendLimitGatekeeper ||
          codeIds.debtGatekeeper === null ||
          codeIds.debtGatekeeper <
            terraChains[chainId].currentCodeIds.debtGatekeeper
        );
      },
      onCosmosChain(chainId) {
        return codeIds.userAccount < cosmosChains[chainId].currentCodeId;
      },
    });
  }

  public get currentAccountMeta() {
    return this._currentAccount;
  }

  public get currentAccount() {
    if (!this._currentAccount) return null;
    return this.getAccount(this._currentAccount);
  }

  public getAccount(account: AbstractSerialized<typeof CurrentAccount>) {
    switch (account.type) {
      case "flex-account":
        return this._gatekeeperConfig.flexAccounts[account.index];
      case "singlesig-wallet":
        return this._singlesigWallets[account.index];
    }
  }

  public setCurrentAccount(
    account: AbstractSerialized<typeof CurrentAccount> | null
  ) {
    this._currentAccount = account;
  }

  public get owner() {
    return this._owner;
  }

  public setOwner(owner: M) {
    this._owner = owner;
  }

  public get gatekeeperConfig() {
    return this._gatekeeperConfig;
  }

  public setGatekeeperConfig(gatekeeperConfig: GatekeeperConfig) {
    this._gatekeeperConfig = gatekeeperConfig;
  }

  public get singlesigWallets() {
    return this._singlesigWallets;
  }

  public upsertSinglesigWallet(
    singlesig: AbstractSerialized<typeof SinglesigWallet>
  ) {
    const index = this._singlesigWallets.findIndex(
      (s) => s.publicKey === singlesig.publicKey
    );
    if (index === -1) {
      this._singlesigWallets.push(singlesig);
    } else {
      this._singlesigWallets[index] = singlesig;
    }
  }

  public removeSinglesigWallet(
    singlesig: AbstractSerialized<typeof SinglesigWallet>
  ) {
    this._singlesigWallets = this._singlesigWallets.filter(
      (s) => s.publicKey !== singlesig.publicKey
    );
  }
}

export function createMultisigWallet<M extends MultisigKey = MultisigKey>(
  serialized: AbstractSerialized<typeof MultisigWalletSchema>,
  factories: {
    MultisigKey: typeof MultisigKey;
    createGatekeeperConfig: typeof createGatekeeperConfig;
  } = {
    MultisigKey,
    createGatekeeperConfig,
  }
) {
  return new MultisigWallet<M>(
    serialized.data.chain,
    factories.MultisigKey.deserialize(
      serialized.data.chain,
      serialized.data.owner
    ) as M,
    serialized.data.proxyAddress.address,
    factories.createGatekeeperConfig(serialized.data.gatekeeperConfig),
    serialized.data.singlesigWallets,
    serialized.data.currentAccount,
    serialized.type === "multisig-demo"
  );
}

export function createObservableMultisigWallet(
  serialized: AbstractSerialized<typeof MultisigWalletSchema>
) {
  const wallet = createMultisigWallet<ObservableMultisigKey>(serialized, {
    MultisigKey: ObservableMultisigKey,
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
  >(wallet, {
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
  });
  return wallet;
}
