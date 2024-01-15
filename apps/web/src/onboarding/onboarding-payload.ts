import { Draftable } from "@/stores/drafts/draft";
import { KVStore } from "@obi-wallet/headless-ui";
import {
  ChainId,
  KeyType,
  MultisigKey,
  ObservableMultisigKey,
  Secp256k1KeyPair,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
import { action, observable } from "mobx";
import { z } from "zod";

const UnclaimedAccountsKvStorePrefix = "unclaimed-accounts";

const UnclaimedAccount = z.object({
  homeAccountAddress: z.string(),
  ownerAddress: z.string(),
  ownerIndex: z.number(),
});

type UnclaimedAccount = z.TypeOf<typeof UnclaimedAccount>;

export class OnboardingPayload implements Draftable {
  @observable protected accessor _multisigKey: MultisigKey;
  @observable protected accessor _name: string;
  @observable protected accessor _image: string;
  @observable protected accessor _currentStep: number;
  protected _unclaimedAccountsKVStore: KVStore;

  constructor(chainId: ChainId) {
    this._multisigKey = ObservableMultisigKey.create(undefined, chainId);
    this._name = "";
    this._image = "";
    this._currentStep = 1;
    this._unclaimedAccountsKVStore = new KVStore(
      UnclaimedAccountsKvStorePrefix,
    );
  }

  public get chainId() {
    return this._multisigKey.chainId;
  }

  public get name() {
    return this._name;
  }

  @action
  public setName(name: string) {
    this._name = name;
  }

  public get image() {
    return this._image;
  }

  @action
  public setImage(image: string) {
    this._image = image;
  }

  public get currentStep() {
    return this._currentStep;
  }

  @action
  public setCurrentStep(step: number) {
    this._currentStep = step;
  }

  public clone() {
    const clone = new OnboardingPayload(this._multisigKey.chainId);
    clone._multisigKey = this._multisigKey.clone();
    clone._name = this.name;
    clone._image = this.image;
    clone._currentStep = this.currentStep;
    return clone as this;
  }

  public equals(other: OnboardingPayload) {
    return (
      this._multisigKey.equals(other._multisigKey) &&
      this._name === other._name &&
      this._image === other._image &&
      this._currentStep === other._currentStep
    );
  }

  public async setPrimaryKey({
    key,
    userSaysDeviceIsNew,
  }: {
    // TODO: here we also need to allow other key types
    key: {
      type: KeyType.Device;
      payload: Secp256k1KeyPair;
    };
    userSaysDeviceIsNew: boolean;
  }) {
    switch (key.type) {
      case KeyType.Device:
        await this._multisigKey.setDeviceKey(key.payload);
        void this.createMagicAccountIfDoesNotExist({
          publicKey: key.payload.publicKey,
          userSaysDeviceIsNew,
        });
        break;
      default:
        throw new Error(`Unsupported primary key type: ${key.type}`);
    }
  }

  // public async setPasskey(keyPair: Secp256k1KeyPair) {
  //   await this._multisigKey.setDeviceKey(keyPair);
  //   // TODO: here we create stuff in the background
  //   // void this.createMagicAccount();
  //   void this.createMagicAccountIfDoesNotExist(keyPair.publicKey);
  // }

  protected async createMagicAccountIfDoesNotExist({
    publicKey,
    userSaysDeviceIsNew,
  }: {
    publicKey: Secp256k1PublicKey;
    userSaysDeviceIsNew: boolean;
  }) {
    const proxyWallets = await this.lookupProxyWallets(publicKey);
    if (proxyWallets.length === 0) {
      if (userSaysDeviceIsNew) {
        // TODO:
        console.log(
          "CHECK! user says device is new and there aren't any, so create magic account",
        );
        await this.createMagicAccount();
      } else {
        // TODO:
        console.log("WARN! user says device is not new but there aren't any");
      }
    } else {
      if (userSaysDeviceIsNew) {
        // TODO:
        console.log("WARN! user says device is new but there are already some");
      } else {
        // TODO:
        console.log(
          "CHECK! user says device is not new and there are already some. Recover",
        );
      }
    }
  }

  protected async createMagicAccount(): Promise<UnclaimedAccount> {
    const account = await this.getUnclaimedAccount();

    if (account) return account;

    const response = await fetch("/api/setup/home-account", {
      method: "POST",
      body: JSON.stringify({
        chainId: this.chainId,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Failed to create magic account: ${response.status}`);
    }

    const result = UnclaimedAccount.safeParse(await response.json());
    if (!result.success) {
      throw new Error(`Failed to parse magic account: ${result.error}`);
    }

    await this.setUnclaimedAccount(result.data);
    return result.data;
  }

  protected async lookupProxyWallets(
    publicKey: Secp256k1PublicKey,
  ): Promise<unknown[]> {
    const response = await fetch(
      "https://proxy-wallets.obiwallet.workers.dev",
      {
        method: "POST",
        body: JSON.stringify({
          chainId: this.chainId,
          publicKey: publicKey.value,
        }),
      },
    );
    if (response.status === 404) {
      console.log("No wallets found");
      return [];
    }

    // TODO:
    const body = await response.json();

    console.log("Wallets found!", body);
    return [];
  }

  protected async getUnclaimedAccount(): Promise<UnclaimedAccount | undefined> {
    return await this._unclaimedAccountsKVStore.get<UnclaimedAccount>(
      this.chainId,
    );
  }

  protected async setUnclaimedAccount(account: UnclaimedAccount) {
    await this._unclaimedAccountsKVStore.set(this.chainId, account);
  }
}
