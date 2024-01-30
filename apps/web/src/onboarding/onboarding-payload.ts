import { Draftable } from "@/stores/drafts/draft";
import { KVStore } from "@obi-wallet/headless-ui";
import {
  ChainId,
  KeyType,
  MultisigKey,
  ObservableMultisigKey,
  SecretJsChains,
} from "@obi-wallet/sdk";
import {
  Secp256k1KeyPair,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { action, observable } from "mobx";
import invariant from "tiny-invariant";
import { z } from "zod";
import { Parameters as KeygenParam } from "@obi-wallet/mpc-ecdsa-wasm-types";
import { TxResponse } from "secretjs";
import { Signer } from "@obi-wallet/mpc-ecdsa-wasm";
import { createSignersAndPresign, keygen } from "@/lib/mpc";

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

export type ProxyWallet = z.TypeOf<typeof ProxyWallet>;

export class OnboardingPayload implements Draftable {
  @observable protected accessor _multisigKey: MultisigKey;
  @observable protected accessor _name: string;
  @observable protected accessor _image: string;
  protected _unclaimedAccountsKVStore: KVStore;
  protected _magicAccountPromise: Promise<UnclaimedAccount> | undefined;

  constructor(chainId: ChainId) {
    this._multisigKey = ObservableMultisigKey.create(undefined, chainId);
    this._name = "";
    this._image = "";
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

  public clone() {
    const clone = new OnboardingPayload(this._multisigKey.chainId);
    clone._multisigKey = this._multisigKey.clone();
    clone._name = this.name;
    clone._image = this.image;
    return clone as this;
  }

  public equals(other: OnboardingPayload) {
    return (
      this._multisigKey.equals(other._multisigKey) &&
      this._name === other._name &&
      this._image === other._image
    );
  }

  public async setPrimaryKey({
    key,
  }: {
    // TODO: here we also need to allow other key types
    key: {
      type: KeyType.Device;
      payload: Secp256k1KeyPair;
    };
  }) {
    switch (key.type) {
      case KeyType.Device:
        await this._multisigKey.setDeviceKey(key.payload);
        break;
      default:
        throw new Error(`Unsupported primary key type: ${key.type}`);
    }
  }

  public async finishWalletCreation() {
    invariant(this._magicAccountPromise, "magic account promise not set, yet");
    const account = await this._magicAccountPromise;
    this.multisigKey.setSetupDetails(account);
    await this.clearUnclaimedAccount();
    return account;
  }

  public createMagicAccountInBackground() {
    this._magicAccountPromise = this.createMagicAccount();
  }

  protected async createMagicAccount(): Promise<UnclaimedAccount> {
    const account = await this.getUnclaimedAccount();

    if (account) return account;

    const homeAccount = await this.createHomeAccount();
    const unclaimedAccount = await this.addKey(homeAccount);
    const response = await this.distributeShares();
    console.log(response);

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

  protected async distributeShares(
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

  public async lookupProxyWallets(publicKey: Secp256k1PublicKey) {
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

  protected async clearUnclaimedAccount() {
    await this._unclaimedAccountsKVStore.set(this.chainId, null);
  }
}
