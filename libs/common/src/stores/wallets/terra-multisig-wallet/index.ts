import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/terra.js";
import { action, computed, makeObservable, observable } from "mobx";

import { terraChains } from "../../../chains";
import { AbstractWallet, WalletType, WithAddress } from "../abstract-wallet";
import {
  SerializedTerraMultisigDemoWallet,
  SerializedTerraMultisigWallet,
} from "../serialized-data";
import * as TerraSerializedData from "./serialized-data";

export { TerraSerializedData };

export type TerraMultisigThresholdPublicKey =
  LegacyAminoMultisigPublicKey.Amino;

export interface TerraMultisig {
  multisig: WithAddress<{ publicKey: TerraMultisigThresholdPublicKey }> | null;
  biometrics: WithAddress<TerraSerializedData.SerializedBiometricsPayload> | null;
  phoneNumber: WithAddress<TerraSerializedData.SerializedPhoneNumberPayload> | null;
  social: WithAddress<TerraSerializedData.SerializedSocialPayload> | null;
  cloud: WithAddress<TerraSerializedData.SerializedCloudPayload> | null;
  email: null;
  nfc: null;
  telegram: null;
  map: null;
  ledger: null;
}

export interface TerraProxyWallet {
  proxyAddress: TerraSerializedData.SerializedProxyAddress;
  admin: {
    biometrics: TerraSerializedData.Secp256k1PublicKey;
    phoneNumber: TerraSerializedData.Secp256k1PublicKey;
    social?: TerraSerializedData.Secp256k1PublicKey;
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

  @computed
  public get chain() {
    return this.serializedWallet.data.chain;
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

  @computed
  public get isOutdated(): boolean {
    const codeId = this.serializedWallet.data.proxyAddress?.codeId ?? null;
    return codeId !== null && codeId < terraChains[this.chain].currentCodeId;
  }

  public get proxyAddress(): TerraSerializedData.SerializedProxyAddress | null {
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
  public async setNextAdmin(
    payload: TerraSerializedData.SerializedMultisigPayload
  ) {
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
  public async setCurrentAdmin(
    payload: TerraSerializedData.SerializedMultisigPayload
  ) {
    this.serializedWallet.data.currentAdmin = payload;
    await this.onChange(this.serializedWallet);
  }

  @action
  public async setPhoneNumberKey(
    payload: TerraSerializedData.SerializedPhoneNumberPayload
  ) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      phoneNumber: payload,
    });
  }

  @action
  public async setBiometricsPublicKey(
    payload: TerraSerializedData.SerializedBiometricsPayload
  ) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      biometrics: payload,
    });
  }

  @action
  public async setSocialPublicKey(
    payload: TerraSerializedData.SerializedSocialPayload
  ) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      social: payload,
    });
  }

  @action
  public async finishProxySetup(
    address: TerraSerializedData.SerializedProxyAddress
  ) {
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
    multisig: TerraSerializedData.SerializedMultisigPayload
  ): TerraMultisig {
    const { biometrics, phoneNumber, social } = multisig;
    const multisigThresholdPublicKey =
      this.createMultisigThresholdPublicKey(multisig);

    return {
      multisig: multisigThresholdPublicKey && {
        address: LegacyAminoMultisigPublicKey.fromAmino(
          multisigThresholdPublicKey
        ).address(),
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
      cloud: null,
      email: null,
      nfc: null,
      telegram: null,
      map: null,
      ledger: null,
    };
  }

  public getSignerTypes(
    multisig: TerraSerializedData.SerializedMultisigPayload
  ) {
    const allKeys = ["biometrics", "phoneNumber", "social"] as const;
    return allKeys.filter((key) => {
      return multisig[key] !== null;
    });
  }

  protected createMultisigThresholdPublicKey(
    multisig: TerraSerializedData.SerializedMultisigPayload
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
    return new LegacyAminoMultisigPublicKey(threshold, publicKeys).toAmino();
  }

  protected get serializedCurrentAdmin() {
    return this.serializedWallet.data.currentAdmin;
  }

  protected get serializedNextAdmin() {
    return this.serializedWallet.data.nextAdmin;
  }
}
