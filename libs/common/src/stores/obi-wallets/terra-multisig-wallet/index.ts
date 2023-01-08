import {
  LegacyAminoMultisigPublicKey,
  SimplePublicKey,
} from "@terra-money/terra.js";
import { action, computed, makeObservable, observable } from "mobx";

import {
  Multisig,
  SerializedCloudPayload,
  SerializedPhoneNumberPayload,
  SerializedSocialPayload,
} from "../../multisig";
import { AbstractWallet, WalletType } from "../../wallets/abstract-wallet";
import { SerializedTerraMultisigWallet } from "../serialized-data";
import {
  SerializedBiometricsPayload,
  SerializedMultisigPayload,
} from "./serialized-data";

export type TerraMultisigThresholdPublicKey = LegacyAminoMultisigPublicKey;

export type WithSimplePublicKey<T> = T & { simplePublicKey: SimplePublicKey };

export interface TerraMultisig {
  multisig: TerraMultisigThresholdPublicKey | null;
  biometrics: WithSimplePublicKey<SerializedBiometricsPayload> | null;
  phoneNumber: WithSimplePublicKey<SerializedPhoneNumberPayload> | null;
  social: WithSimplePublicKey<SerializedSocialPayload> | null;
  cloud: WithSimplePublicKey<SerializedCloudPayload> | null;
  email: null;
}

export type TerraMultisigKey = keyof Omit<Multisig, "multisig">;

export class TerraMultisigWallet extends AbstractWallet {
  protected readonly _id: string;

  @observable
  protected serializedWallet: SerializedTerraMultisigWallet;
  protected onChange: (
    serializedWallet: SerializedTerraMultisigWallet
  ) => Promise<void>;

  constructor({
    id,
    serializedWallet,
    onChange,
  }: {
    id: string;
    serializedWallet: SerializedTerraMultisigWallet;
    onChange: (
      serializedWallet: SerializedTerraMultisigWallet
    ) => Promise<void>;
  }) {
    super();
    this._id = id;
    this.serializedWallet = serializedWallet;
    this.onChange = onChange;
    makeObservable(this);
  }

  get address(): string | null {
    return this.serializedWallet.data.proxyAddress?.address ?? null;
  }

  public get id() {
    return this._id;
  }

  get isReady(): boolean {
    return false;
  }

  // TODO:
  get type(): WalletType {
    return WalletType.Multisig;
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

  @action
  public async setBiometricsPublicKey(payload: SerializedBiometricsPayload) {
    await this.setNextAdmin({
      ...this.nextAdmin,
      biometrics: payload,
    });
  }

  protected hydrateMultisig(
    multisig: SerializedMultisigPayload
  ): TerraMultisig {
    const { biometrics, phoneNumber, social } = multisig;
    const multisigThresholdPublicKey =
      this.createMultisigThresholdPublicKey(multisig);

    return {
      multisig: multisigThresholdPublicKey,
      biometrics: biometrics && {
        simplePublicKey: SimplePublicKey.fromAmino(biometrics.publicKey),
        ...biometrics,
      },
      phoneNumber: phoneNumber && {
        simplePublicKey: SimplePublicKey.fromAmino(phoneNumber.publicKey),
        ...phoneNumber,
      },
      social: social && {
        // @ts-expect-error: handle social
        simplePublicKey: SimplePublicKey.fromAmino(social.publicKey),
        ...social,
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
        // @ts-expect-error: handle social
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
