import {
  createMultisigThresholdPubkey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
} from "@cosmjs/amino";
import { action, computed, makeObservable, observable } from "mobx";
import R from "ramda";

import * as CosmosSerializedData from "./serialized-data";
import { healthChecks } from "../../../health-checks";
import { ChainStore } from "../../chain";
import { AbstractWallet, WalletType, WithAddress } from "../abstract-wallet";
import {
  SerializedCosmosMultisigDemoWallet,
  SerializedCosmosMultisigWallet,
} from "../serialized-data";

export { CosmosSerializedData };

export type CosmosMultisigThresholdPublicKey = MultisigThresholdPubkey;

export interface CosmosMultisig {
  multisig: WithAddress<{
    publicKey: CosmosMultisigThresholdPublicKey;
  }> | null;
  biometrics: WithAddress<CosmosSerializedData.SerializedBiometricsPayload> | null;
  phoneNumber: WithAddress<CosmosSerializedData.SerializedPhoneNumberPayload> | null;
  social: WithAddress<CosmosSerializedData.SerializedSocialPayload> | null;
  cloud: WithAddress<CosmosSerializedData.SerializedCloudPayload> | null;
  email: null;
  nfc: null;
  telegram: null;
  map: null;
  ledger: null;
}

export type CosmosMultisigKey = keyof Omit<CosmosMultisig, "multisig">;

export interface CosmosProxyWallet {
  proxyAddress: CosmosSerializedData.SerializedProxyAddress;
  admin: {
    biometrics: CosmosSerializedData.Secp256k1PublicKey;
    phoneNumber: CosmosSerializedData.Secp256k1PublicKey;
    social?: CosmosSerializedData.Secp256k1PublicKey;
  };
}

export class CosmosMultisigWallet extends AbstractWallet {
  protected readonly chainStore: ChainStore;

  protected readonly _id: string;

  @observable
  protected serializedWallet:
    | SerializedCosmosMultisigWallet
    | SerializedCosmosMultisigDemoWallet;
  protected onChange: (
    serializedWallet:
      | SerializedCosmosMultisigWallet
      | SerializedCosmosMultisigDemoWallet
  ) => Promise<void>;

  @observable
  public keyInRecovery: CosmosMultisigKey | null = null;
  @observable
  protected _walletInRecovery: CosmosProxyWallet | null = null;
  @observable
  protected _updateProposed = false;

  constructor({
    chainStore,
    id,
    serializedWallet,
    onChange,
  }: {
    chainStore: ChainStore;
    id: string;
    serializedWallet:
      | SerializedCosmosMultisigWallet
      | SerializedCosmosMultisigDemoWallet;
    onChange: (
      serializedWallet:
        | SerializedCosmosMultisigWallet
        | SerializedCosmosMultisigDemoWallet
    ) => Promise<void>;
  }) {
    super();
    this.chainStore = chainStore;
    this._id = id;
    this.serializedWallet = serializedWallet;
    this.onChange = onChange;
    makeObservable(this);
  }

  public get id() {
    return this._id;
  }

  public get address() {
    return this.proxyAddress?.address ?? null;
  }

  public get type() {
    return WalletType.CosmosMultisig;
  }

  public get isReady() {
    return (
      this.currentAdmin !== null &&
      this.keyInRecovery === null &&
      this.walletInRecovery === null
    );
  }

  public get proxyAddress(): CosmosSerializedData.SerializedProxyAddress | null {
    return this.proxyAddresses[this.chainStore.currentCosmosChain] ?? null;
  }

  public get walletInRecovery() {
    return this._walletInRecovery;
  }

  public async identifyProblems() {
    const currentChain = this.chainStore.currentCosmosChain;
    const { types, checks } = healthChecks[currentChain];

    const potentialProblems = await Promise.all(
      R.map(async (type) => {
        const isProblem = !(await checks[type](this));
        return {
          type,
          isProblem,
        };
      }, types)
    );
    return potentialProblems
      .filter(({ isProblem }) => isProblem)
      .map(({ type }) => type);
  }

  @action
  public async setWalletInRecovery(wallet: CosmosProxyWallet) {
    await this.setCurrentAdmin({
      biometrics: {
        publicKey: wallet.admin.biometrics,
      },
      phoneNumber: this.nextAdmin.phoneNumber,
      social: wallet.admin.social
        ? {
            publicKey: wallet.admin.social,
          }
        : null,
      cloud: null,
    });
    if (wallet.admin.social) {
      await this.setSocialPublicKey({
        publicKey: wallet.admin.social,
      });
    }
    this._walletInRecovery = wallet;
  }

  public get updateProposed() {
    return this._updateProposed;
  }

  @action
  public setUpdateProposed(updateProposed: boolean) {
    this._updateProposed = updateProposed;
  }

  @computed
  public get isDemo() {
    return this.serializedWallet.type === "cosmos-multisig-demo";
  }

  @computed
  public get nextAdmin(): CosmosMultisig {
    return this.hydrateMultisig(
      this.serializedNextAdmin,
      this.chainStore.currentCosmosChainInformation.prefix
    );
  }

  @action
  public async setNextAdmin(
    payload: CosmosSerializedData.SerializedMultisigPayload
  ) {
    this.serializedWallet.data.nextAdmin = payload;
    await this.onChange(this.serializedWallet);
  }

  @computed
  public get currentAdmin(): CosmosMultisig | null {
    return (
      this.serializedCurrentAdmin &&
      this.hydrateMultisig(
        this.serializedCurrentAdmin,
        this.chainStore.currentCosmosChainInformation.prefix
      )
    );
  }

  @action
  public async setCurrentAdmin(
    payload: CosmosSerializedData.SerializedMultisigPayload | null
  ) {
    this.serializedWallet.data.currentAdmin = payload;
    await this.onChange(this.serializedWallet);
  }

  @action
  public async setPhoneNumberKey(
    payload: CosmosSerializedData.SerializedPhoneNumberPayload
  ) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      phoneNumber: payload,
    });
  }

  @action
  public async setBiometricsPublicKey(
    payload: CosmosSerializedData.SerializedBiometricsPayload
  ) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      biometrics: payload,
    });
  }

  @action
  public async setSocialPublicKey(
    payload: CosmosSerializedData.SerializedSocialPayload
  ) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      social: payload,
    });
  }

  @action
  public async finishProxySetup(
    address: CosmosSerializedData.SerializedProxyAddress
  ) {
    this.keyInRecovery = null;
    this._walletInRecovery = null;
    this._updateProposed = false;
    this.proxyAddresses[this.chainStore.currentCosmosChain] = address;
    await this.setCurrentAdmin(this.serializedNextAdmin);
  }

  @action
  public recover(keyId: CosmosMultisigKey) {
    this.keyInRecovery = keyId;
    this._updateProposed = false;
  }

  @action
  public async cancelRecovery() {
    if (this.serializedCurrentAdmin) {
      await this.setNextAdmin(this.serializedCurrentAdmin);
    }
    this.keyInRecovery = null;
    this._walletInRecovery = null;
    this._updateProposed = false;
  }

  protected hydrateMultisig(
    multisig: CosmosSerializedData.SerializedMultisigPayload,
    prefix: string
  ): CosmosMultisig {
    const { biometrics, phoneNumber, social } = multisig;
    const multisigThresholdPublicKey =
      this.createMultisigThresholdPublicKey(multisig);

    return {
      multisig: multisigThresholdPublicKey && {
        address: pubkeyToAddress(multisigThresholdPublicKey, prefix),
        publicKey: multisigThresholdPublicKey,
      },
      biometrics: biometrics && {
        address: pubkeyToAddress(biometrics.publicKey, prefix),
        ...biometrics,
      },
      phoneNumber: phoneNumber && {
        address: pubkeyToAddress(phoneNumber.publicKey, prefix),
        ...phoneNumber,
      },
      social: social && {
        address: pubkeyToAddress(social.publicKey, prefix),
        ...social,
      },
      cloud: null,
      email: null,
      nfc: null,
      telegram: null,
      map: null,
      ledger: null,
    };
  }

  public getSignerTypes(
    multisig: CosmosSerializedData.SerializedMultisigPayload
  ) {
    const allKeys = ["biometrics", "phoneNumber", "social", "cloud"] as const;
    return allKeys.filter((key) => {
      return multisig[key] !== null;
    });
  }

  protected createMultisigThresholdPublicKey(
    multisig: CosmosSerializedData.SerializedMultisigPayload
  ): CosmosMultisigThresholdPublicKey | null {
    const publicKeys = [];
    for (const key of this.getSignerTypes(multisig)) {
      const keyPayload = multisig[key];
      if (keyPayload) {
        publicKeys.push(keyPayload.publicKey);
      }
    }

    if (publicKeys.length === 0) {
      return null;
    }

    const threshold = publicKeys.length >= 4 ? 2 : 1;
    return createMultisigThresholdPubkey(publicKeys, threshold);
  }

  protected get proxyAddresses() {
    return this.serializedWallet.data.proxyAddresses;
  }

  protected get serializedCurrentAdmin() {
    return this.serializedWallet.data.currentAdmin;
  }

  protected get serializedNextAdmin() {
    return this.serializedWallet.data.nextAdmin;
  }
}
