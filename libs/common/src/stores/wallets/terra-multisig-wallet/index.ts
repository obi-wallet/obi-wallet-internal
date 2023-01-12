import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/terra.js";
import { action, computed, makeObservable, observable } from "mobx";

import { MultisigKey } from "../../multisig";
import { AbstractWallet, WalletType } from "../../wallets/abstract-wallet";
import {
  SerializedTerraMultisigWallet,
  SerializedTerraMultisigDemoWallet,
} from "../serialized-data";
import {
  Secp256k1PublicKey,
  SerializedBiometricsPayload,
  SerializedMultisigPayload,
  SerializedProxyAddress,
  SerializedNFCPayload,
  SerializedCloudPayload,
  SerializedPhoneNumberPayload,
  SerializedSocialPayload,
} from "./serialized-data";

export type TerraMultisigThresholdPublicKey = LegacyAminoMultisigPublicKey;

export type WithAddress<T> = T & { address: string };

export interface TerraMultisig {
  multisig: WithAddress<{ publicKey: TerraMultisigThresholdPublicKey }> | null;
  biometrics: WithAddress<SerializedBiometricsPayload> | null;
  phoneNumber: WithAddress<SerializedPhoneNumberPayload> | null;
  social: WithAddress<SerializedSocialPayload> | null;
  nfc: WithAddress<SerializedNFCPayload> | null;
  cloud: WithAddress<SerializedCloudPayload> | null;
  email: null;
}

export interface TerraProxyWallet {
  proxyAddress: SerializedProxyAddress;
  admin: {
    biometrics: Secp256k1PublicKey;
    phoneNumber: Secp256k1PublicKey;
    social?: Secp256k1PublicKey;
    nfc?: Secp256k1PublicKey;
  };
}

export type TerraMultisigKey = keyof Omit<TerraMultisig, "multisig">;

export class TerraMultisigWallet extends AbstractWallet {
  protected readonly _id: string;

  @observable
  public keyInRecovery: TerraMultisigKey | null = null;
  @observable
  protected _walletInRecovery: TerraProxyWallet | null = null;
  @observable
  protected _updateProposed = false;

  @observable
  protected serializedWallet:
    | SerializedTerraMultisigWallet
    | SerializedTerraMultisigDemoWallet;
  protected onChange: (
    serializedWallet:
      | SerializedTerraMultisigWallet
      | SerializedTerraMultisigDemoWallet
  ) => Promise<void>;

  constructor({
    id,
    serializedWallet,
    onChange,
  }: {
    id: string;
    serializedWallet:
      | SerializedTerraMultisigWallet
      | SerializedTerraMultisigDemoWallet;
    onChange: (
      serializedWallet:
        | SerializedTerraMultisigWallet
        | SerializedTerraMultisigDemoWallet
    ) => Promise<void>;
  }) {
    super();
    this._id = id;
    this.serializedWallet = serializedWallet;
    this.onChange = onChange;
    makeObservable(this);
  }

  public get id() {
    return this._id;
  }

  get address(): string | null {
    return this.proxyAddress?.address ?? null;
  }

  get type(): WalletType {
    return WalletType.TerraMultisig;
  }

  get isReady(): boolean {
    return (
      this.currentAdmin !== null &&
      this.keyInRecovery === null &&
      this.walletInRecovery === null
    );
  }

  public get proxyAddress(): SerializedProxyAddress | null {
    return this.serializedWallet.data.proxyAddress ?? null;
  }

  public get walletInRecovery() {
    return this._walletInRecovery;
  }

  @action
  public async setWalletInRecovery(wallet: TerraProxyWallet) {
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
      nfc: wallet.admin.nfc
        ? {
            publicKey: wallet.admin.nfc,
        }
        : null,
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
    return this.serializedWallet.type === "terra-multisig-demo";
  }

  @computed
  public get nextAdmin(): TerraMultisig {
    return this.hydrateMultisig(this.serializedNextAdmin);
  }

  @action
  public async setNextAdmin(payload: SerializedMultisigPayload) {
    this.serializedWallet.data.nextAdmin = payload;
    await this.onChange(this.serializedWallet);
  }

  public get currentAdmin(): TerraMultisig | null {
    return (
      this.serializedCurrentAdmin &&
      this.hydrateMultisig(this.serializedCurrentAdmin)
    );
  }

  @action
  public async setCurrentAdmin(payload: SerializedMultisigPayload) {
    this.serializedWallet.data.currentAdmin = payload;
    await this.onChange(this.serializedWallet);
  }

  @action
  public async setPhoneNumberKey(payload: SerializedPhoneNumberPayload) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      phoneNumber: payload,
    });
  }

  @action
  public async setBiometricsPublicKey(payload: SerializedBiometricsPayload) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      biometrics: payload,
    });
  }

  @action
  public async setSocialPublicKey(payload: SerializedSocialPayload) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      social: payload,
    });
  }

  @action
  public async setNFCPublicKey(payload: SerializedNFCPayload) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      nfc: payload,
    });
  }

  @action
  public async finishProxySetup(address: SerializedProxyAddress) {
    this.keyInRecovery = null;
    this._walletInRecovery = null;
    this._updateProposed = false;
    this.serializedWallet.data.proxyAddress = address;
    await this.setCurrentAdmin(this.serializedNextAdmin);
  }

  @action
  public recover(keyId: TerraMultisigKey) {
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
    multisig: SerializedMultisigPayload
  ): TerraMultisig {
    const { biometrics, phoneNumber, social, nfc } = multisig;
    const multisigThresholdPublicKey =
      this.createMultisigThresholdPublicKey(multisig);

    return {
      multisig: multisigThresholdPublicKey && {
        address: multisigThresholdPublicKey.address(),
        publicKey: multisigThresholdPublicKey,
      },
      biometrics: biometrics && {
        address: SimplePublicKey.fromAmino(biometrics.publicKey).address(),
        ...biometrics,
      },
      phoneNumber: phoneNumber && {
        address: SimplePublicKey.fromAmino(phoneNumber.publicKey).address(),
        ...phoneNumber,
      },
      social: social && {
        address: SimplePublicKey.fromAmino(social.publicKey).address(),
        ...social,
      },
      nfc: nfc && {
        address: SimplePublicKey.fromAmino(nfc.publicKey).address(),
        ...nfc,
      },
      cloud: null,
      email: null,
    };
  }

  public getSignerTypes(multisig: SerializedMultisigPayload) {
    const allKeys = ["biometrics", "phoneNumber", "social"] as const;
    return allKeys.filter((key) => {
      return multisig[key] !== null;
    });
  }

  protected createMultisigThresholdPublicKey(
    multisig: SerializedMultisigPayload
  ): TerraMultisigThresholdPublicKey | null {
    const publicKeys = [];
    for (const key of this.getSignerTypes(multisig)) {
      const keyPayload = multisig[key];
      if (keyPayload) {
        publicKeys.push(SimplePublicKey.fromAmino(keyPayload.publicKey));
      }
    }

    if (publicKeys.length === 0) {
      return null;
    }

    const threshold = publicKeys.length >= 4 ? 2 : 1;
    return new LegacyAminoMultisigPublicKey(threshold, publicKeys);
  }

  protected get serializedCurrentAdmin() {
    return this.serializedWallet.data.currentAdmin;
  }

  protected get serializedNextAdmin() {
    return this.serializedWallet.data.nextAdmin;
  }
}
