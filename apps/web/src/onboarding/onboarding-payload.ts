import { createSignersAndPresign, keygen } from "@/lib/mpc";
import { Signer } from "@mpc-sdk/mpc-bindings";
import { Draftable } from "@/stores/drafts/draft";
import { Parameters as KeygenParam } from "@/types/mpc-ecdsa-wasm-types";
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
import { TxResponse } from "secretjs";

import invariant from "tiny-invariant";
import { z } from "zod";

const UnclaimedAccountsKvStorePrefix = "unclaimed-accounts";

// TODO: here we probably also want to persist codeId
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

const ProxyWallet = z.object({
  proxyAddress: z.object({
    address: z.string(),
    codeId: z.number(),
  }),
  evmUserContractAddress: z.string(),
  evmSigningAddress: z.string(),
  owner: z.object({
    threshold: z.string(),
    // TODO: here we should probably be more specific regarding the structure of `keys`, review /add logic and make sure the schema usage is consistent here.
    keys: z.array(z.unknown()),
  }),
});

type ProxyWallet = z.TypeOf<typeof ProxyWallet>;

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

        this.distributeShares();
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
    console.log(proxyWallets.length);
    if (proxyWallets.length === 0) {
      if (userSaysDeviceIsNew) {
        // TODO:
        console.log(
          "CHECK! user says device is new and there aren't any, so create magic account",
        );
        this._magicAccountPromise = this.createMagicAccount();
      } else {
        // TODO: ask for user confirmation to create a new
        console.log("WARN! user says device is not new but there aren't any");
      }
    } else {
      if (userSaysDeviceIsNew) {
        // TODO: ask for user confirmation if they really want to create a new wallet instead of recovering
        console.log("WARN! user says device is new but there are already some");
      } else {
        // TODO: if only a single wallet > recover that one. If multliple, ask user which one to recover
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

    const schema = z.array(ProxyWallet);
    const result = schema.safeParse(await response.json());
    if (!result.success) {
      throw new Error(`Failed to parse proxy wallets: ${result.error}`);
    }
    return result.data;
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

  // assume parties=3 and threshold=1
  public async distributeShares(
    keygenParam: KeygenParam = { parties: 3, threshold: 1 },
    contractCombo: number[] = [1, 3],
    backupCombo: number[] = [2, 3],
  ) {
    try {
      const account = await this.getUnclaimedAccount();
      if (!account) {
        throw new Error(`Account is not created`);
      }

      const shares = keygen(keygenParam);

      const signersForContract: Signer[] = createSignersAndPresign(
        shares,
        contractCombo,
      );
      const contractSignersCompletedOfflineStage =
        signersForContract[0]?.completedOfflineStage();

      // user share that is used to sign transaction with contract share
      const completedOfflineStageForContrtact =
        signersForContract[1]?.completedOfflineStage();
      const userShareForContract = {
        k_i: completedOfflineStageForContrtact.sign_keys.k_i,
        R: completedOfflineStageForContrtact.R,
        sigma_i: completedOfflineStageForContrtact.sigma_i,
        pubkey: completedOfflineStageForContrtact.local_key.y_sum_s,
      };

      const signersForBackup = createSignersAndPresign(shares, backupCombo);
      const backupSignersCompletedOfflineStage =
        signersForBackup[0]?.completedOfflineStage();

      // user share that is used to sign transaction with backup share
      const completedOfflineStageForBackup =
        signersForBackup[1]?.completedOfflineStage();
      const userShareForBackup = {
        k_i: completedOfflineStageForBackup.sign_keys.k_i,
        R: completedOfflineStageForBackup.R,
        sigma_i: completedOfflineStageForBackup.sigma_i,
        pubkey: completedOfflineStageForBackup.local_key.y_sum_s,
      };

      // distribute shares to contract and db
      const response = await fetch("/api/setup/distribute-shares", {
        method: "POST",
        body: JSON.stringify({
          contractParticipants: contractCombo,
          chainId: this.chainId,
          contractSignersCompletedOfflineStage,
          backupSignersCompletedOfflineStage,
          accountAddress: account?.homeAccountAddress,
        }),
      });

      if (response.status !== 200) {
        throw new Error(`Failed to distribute shares: ${response.status}`);
      }

      const result: { success: boolean; tx: TxResponse } =
        await response.json();
      if (!result.success) {
        throw new Error(`Failed to distribute contract share`);
      }

      // we should save these to store for persist?
      return {
        shareForContract: userShareForContract,
        shareForBackup: userShareForBackup,
      };
    } catch (error) {
      throw console.log(`Error on distribute share:`, error);
    }
  }
}
