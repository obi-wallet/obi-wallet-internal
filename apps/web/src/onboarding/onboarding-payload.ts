import { Draftable } from "@/stores/drafts/draft";
import { KVStore } from "@obi-wallet/headless-ui";
import {
  ChainId,
  KeyType,
  MultisigKey,
  ObservableMultisigKey,
  Secp256k1KeyPair,
  Secp256k1PublicKey,
  SecretJsChains,
} from "@obi-wallet/sdk";
import { action, observable } from "mobx";
import invariant from "tiny-invariant";
import { z } from "zod";

const UnclaimedAccountsKvStorePrefix = "unclaimed-accounts";

const HomeAccount = z.object({
  homeAccountAddress: z.string(),
  ownerAddress: z.string(),
  ownerIndex: z.number(),
});

type HomeAccount = z.TypeOf<typeof HomeAccount>;

const UnclaimedAccount = HomeAccount.extend({
  evmSigningAddress: z.string(),
  evmUserContractAddress: z.string(),
});

type UnclaimedAccount = z.TypeOf<typeof UnclaimedAccount>;

export class OnboardingPayload implements Draftable {
  @observable protected accessor _multisigKey: MultisigKey;
  @observable protected accessor _name: string;
  @observable protected accessor _image: string;
  @observable protected accessor _currentStep: number;
  protected _unclaimedAccountsKVStore: KVStore;
  protected _magicAccountPromise: Promise<UnclaimedAccount> | undefined;

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

  public get multisigKey() {
    return this._multisigKey;
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

  public async finishWalletCreation() {
    invariant(this._magicAccountPromise, "magic account promise not set, yet");
    return await this._magicAccountPromise;
  }

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
        this._magicAccountPromise = this.createMagicAccount();
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

    const homeAccount = await this.createHomeAccount();
    const unclaimedAccount = await this.addKey(homeAccount);

    await this.setUnclaimedAccount(unclaimedAccount);
    return unclaimedAccount;
  }

  protected async createHomeAccount(): Promise<HomeAccount> {
    const response = await fetch("/api/setup/home-account", {
      method: "POST",
      body: JSON.stringify({
        chainId: this.chainId,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Failed to create magic account: ${response.status}`);
    }

    const result = HomeAccount.safeParse(await response.json());
    if (!result.success) {
      throw new Error(`Failed to parse magic account: ${result.error}`);
    }

    return result.data;
  }

  protected async addKey(account: HomeAccount): Promise<UnclaimedAccount> {
    const chain = SecretJsChains[this.chainId];
    const response = await fetch("/api/setup/add-key", {
      method: "POST",
      body: JSON.stringify({
        chainId: this.chainId,
        userEntryAddress: account.homeAccountAddress,
        userEntryCodeHash: chain.userEntry.codeHash,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Failed to add key: ${response.status}`);
    }

    const schema = z.object({
      success: z.literal(true),
      evmSigningAddress: z.string(),
      evmUserContractAddress: z.string(),
    });

    const result = schema.safeParse(await response.json());
    if (!result.success) {
      throw new Error(`Failed to parse add key response: ${result.error}`);
    }

    return {
      ...account,
      evmSigningAddress: result.data.evmSigningAddress,
      evmUserContractAddress: result.data.evmUserContractAddress,
    };
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
    const data = await this._unclaimedAccountsKVStore.get<unknown>(
      this.chainId,
    );
    const result = UnclaimedAccount.safeParse(data);
    return result.success ? result.data : undefined;
  }

  protected async setUnclaimedAccount(account: UnclaimedAccount) {
    await this._unclaimedAccountsKVStore.set(this.chainId, account);
  }
}
