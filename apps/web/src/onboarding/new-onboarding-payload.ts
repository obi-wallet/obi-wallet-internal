import { HomeChain } from "@/home-chain";
import { MultisigKeyEncryption, SharesLocalEncryption } from "@/lib/encryption";
import { rootStore } from "@/stores";
import { Draftable } from "@/stores/drafts/draft";
import { DistributeSharesResponse } from "@/stores/mpc";
import { Base58EncodedString } from "@obi-wallet/encoding";
import {
  BackupShare,
  EasyShare,
  HomeChainId,
  HomeChainIdSchema,
  KeyType,
  MpcWallet,
  MultisigKey,
  NetworkShare,
  ObservableMultisigKey,
  Serialized,
  WalletData,
} from "@obi-wallet/sdk";
import { generateEd25519KeyPair } from "@obi-wallet/sdk-ed25519";
import { serialize } from "@obi-wallet/sdk-json";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { action, observable, toJS } from "mobx";
import invariant from "tiny-invariant";
import { z } from "zod";

const UnclaimedHomeAccount = z.object({
  homeAccountAddress: z.string(),
  ownerAddress: z.string(),
  ownerIndex: z.number(),
});

type UnclaimedHomeAccount = z.TypeOf<typeof UnclaimedHomeAccount>;

const OnboardingPayloadSchema = z.object({
  homeChain: HomeChainIdSchema,
  multisigKey: MultisigKey.schema.migratableSchema,
  userData: z.object({
    name: z.string(),
    image: z.string(),
  }),
  ownerConfirmed: z.boolean(),
  shares: z
    .object({
      keygenParam: z.object({
        parties: z.number(),
        threshold: z.number(),
      }),
      backupParticipants: z.array(z.number()),
      networkParticipants: z.array(z.number()),
      easyShare: EasyShare,
      backupShare: BackupShare,
      networkShare: NetworkShare,
    })
    .nullable(),
  encryptedShares: z
    .object({
      easyShare: z.string(),
      backupShare: z.string(),
    })
    .nullable(),
  distributedShares: z.boolean(),
  unclaimedHomeAccount: UnclaimedHomeAccount.nullable(),
  homeAccountClaimed: z.boolean(),
});

export class NewOnboardingPayload implements Draftable {
  @observable protected accessor _multisigKey: MultisigKey;
  @observable protected accessor _ownerConfirmed = false;
  @observable protected accessor _name = "";
  @observable protected accessor _image = "";
  @observable protected accessor _shares: DistributeSharesResponse | null =
    null;
  @observable protected accessor _encryptedShares: {
    easyShare: string;
    backupShare: string;
  } | null = null;
  @observable protected accessor _distributedShares = false;
  @observable
  protected accessor _unclaimedHomeAccount: UnclaimedHomeAccount | null = null;
  @observable protected accessor _homeAccountClaimed: boolean = false;
  @observable protected accessor _walletData: WalletData | null = null;
  @observable protected accessor _ed25519KeyPair: {
    publicKey: Base58EncodedString;
    encryptedPrivateKey: string;
  } | null = null;

  public constructor(homeChainId: HomeChainId) {
    this._multisigKey = ObservableMultisigKey.create(homeChainId);
  }

  public get homeChainId() {
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

  public toJSON(): z.infer<typeof OnboardingPayloadSchema> {
    return OnboardingPayloadSchema.parse({
      homeChain: this.homeChainId,
      multisigKey: this._multisigKey.toJSON()!,
      ownerConfirmed: this._ownerConfirmed,
      userData: {
        name: this._name,
        image: this._image,
      },
      shares: this._shares,
      encryptedShares: this._encryptedShares,
      distributedShares: this._distributedShares,
      unclaimedHomeAccount: this._unclaimedHomeAccount,
      homeAccountClaimed: this._homeAccountClaimed,
    });
  }

  public toMpcWalletData(): Serialized<MpcWallet> {
    invariant(this._ed25519KeyPair, "Ed25519 key pair is not available");
    invariant(this._encryptedShares, "Shares are not encrypted");
    invariant(this._unclaimedHomeAccount, "Home account is not available");
    invariant(this._distributedShares, "Shares have not been distributed");

    return MpcWallet.schema.migratableSchema.parse({
      homeChain: this.homeChainId,
      owner: this._multisigKey.toJSON()!,
      encryptedShares: {
        easy: this._encryptedShares.easyShare,
        backup: this._encryptedShares.backupShare,
      },
      ed25519KeyPair: this._ed25519KeyPair,
      userEntryAddress: this._unclaimedHomeAccount.homeAccountAddress,
      previousWalletData: toJS(this._walletData),
    });
  }

  public async continueFlow() {
    // Can be done without owner
    await Promise.all([
      this.fetchSharesIfNecessary(),
      this.createHomeAccountIfNecessary(),
    ]);

    // Next steps require the owner
    if (!this._ownerConfirmed) return;
    await this.encryptSharesIfNecessary();
    await this.encryptEd25519KeyPairIfNecessary();
    await this.distributeSharesIfNecessary();
    await this.claimHomeAccountIfNecessary();
  }

  @action
  public setPrimaryKey({
    key,
  }: {
    key: {
      type: KeyType.Passkey;
      payload: Secp256k1KeyPair;
    };
  }) {
    const newKey = (() => {
      switch (key.type) {
        case KeyType.Passkey:
          return this._multisigKey.addPasskeyKey(key.payload);
        default:
          throw new Error(`Unsupported primary key type: ${key.type}`);
      }
    })();
    this._multisigKey.setPrimaryKey(newKey);
  }

  @action
  public confirmOwner() {
    this._ownerConfirmed = true;
  }

  protected async fetchSharesIfNecessary() {
    if (this._distributedShares || this._shares) return;
    invariant(rootStore.current, "Root store is not initialized");
    this._shares = await rootStore.current.mpcStore.getShares();
  }

  protected async createHomeAccountIfNecessary() {
    if (this._unclaimedHomeAccount) return;
    const response = await fetch("/api/setup/home-account", {
      method: "POST",
      body: serialize({
        chainId: this.homeChainId,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Failed to create magic account: ${response.status}`);
    }

    const result = UnclaimedHomeAccount.safeParse(await response.json());
    if (!result.success) {
      throw new Error(
        `Failed to parse magic account: ${serialize(result.error)}`,
      );
    }

    this._unclaimedHomeAccount = result.data;
  }

  protected async encryptSharesIfNecessary() {
    if (this._encryptedShares) return;
    invariant(this._shares, "Shares are not available");

    const sharesLocalEncryption = new SharesLocalEncryption(this._multisigKey);
    const { easy, backup } = await sharesLocalEncryption.encrypt({
      easy: this._shares.easyShare,
      backup: this._shares.backupShare,
    });
    this._encryptedShares = {
      easyShare: easy,
      backupShare: backup,
    };
  }

  protected async encryptEd25519KeyPairIfNecessary() {
    if (this._ed25519KeyPair) return;
    const keyPair = generateEd25519KeyPair();
    const multisigKeyEncryption = new MultisigKeyEncryption(
      this._multisigKey.publicKey,
    );
    this._ed25519KeyPair = {
      publicKey: keyPair.publicKey.value,
      encryptedPrivateKey: await multisigKeyEncryption.encrypt(
        keyPair.privateKey,
      ),
    };
  }

  protected async distributeSharesIfNecessary() {
    if (this._distributedShares) return;
    invariant(this._shares, "Shares are not available");
    invariant(this._encryptedShares, "Shares are not encrypted");
    invariant(this._unclaimedHomeAccount, "Home account is not available");

    const response = await fetch("/api/setup/distribute-shares", {
      method: "POST",
      body: serialize({
        homeChainId: this.homeChainId,
        networkParticipants: this._shares.networkParticipants,
        networkShare: this._shares.networkShare,
        userEntryAddress: this._unclaimedHomeAccount.homeAccountAddress,
        userEntryCodeHash: await HomeChain.chainId(
          this.homeChainId,
        ).userEntryCodeHash(this._unclaimedHomeAccount.homeAccountAddress),
        ownerIndex: this._unclaimedHomeAccount.ownerIndex,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Failed to distribute shares: ${response.status}`);
    }

    const result: { success: boolean } = await response.json();
    if (!result.success) {
      throw new Error("Failed to distribute shares");
    }

    // Clear local network share
    this._shares = null;
    this._distributedShares = true;
  }

  protected async claimHomeAccountIfNecessary() {
    if (this._homeAccountClaimed) return;
    invariant(this._unclaimedHomeAccount, "Home account is not available");

    const homeChain = HomeChain.chainId(this.homeChainId);
    this._walletData = await homeChain.getWalletData({
      wallet: this.toMpcWalletData(),
      keyMetaData: {},
    });

    const userEntryCodeHash = await homeChain.userEntryCodeHash(
      this._unclaimedHomeAccount.homeAccountAddress,
    );
    const userAccount = await homeChain.userAccount({
      userEntryAddress: this._unclaimedHomeAccount.homeAccountAddress,
      userEntryCodeHash,
    });

    const response = await fetch("/api/setup/first-update-owner", {
      method: "POST",
      body: serialize({
        homeChainId: this.homeChainId,
        owner: this._multisigKey.toJSON(),
        ownerAddress: this._multisigKey.address,
        userEntryAddress: this._unclaimedHomeAccount.homeAccountAddress,
        userEntryCodeHash,
        userAccountAddress: userAccount.userAccountAddress,
        userAccountCodeHash: userAccount.userAccountCodeHash,
        ownerIndex: this._unclaimedHomeAccount.ownerIndex,
        walletData: this._walletData,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Failed to update owner: ${response.status}`);
    }

    const result: { success: boolean } = await response.json();
    if (!result.success) {
      throw new Error("Failed to update owner");
    }

    this._homeAccountClaimed = true;
  }

  public static deserialize(data: z.infer<typeof OnboardingPayloadSchema>) {
    OnboardingPayloadSchema.parse(data);
    const payload = new NewOnboardingPayload(data.homeChain);
    payload._multisigKey = ObservableMultisigKey.create(
      data.homeChain,
      data.multisigKey,
    );
    payload._ownerConfirmed = data.ownerConfirmed;
    payload._name = data.userData.name;
    payload._image = data.userData.image;
    payload._shares = data.shares;
    payload._encryptedShares = data.encryptedShares;
    payload._distributedShares = data.distributedShares;
    payload._unclaimedHomeAccount = data.unclaimedHomeAccount;
    payload._homeAccountClaimed = data.homeAccountClaimed;
    return payload;
  }

  public clone() {
    const clone = new NewOnboardingPayload(this.homeChainId);
    clone._multisigKey = this._multisigKey.clone();
    clone._ownerConfirmed = this._ownerConfirmed;
    clone._name = this._name;
    clone._image = this._image;
    clone._shares = this._shares;
    clone._encryptedShares = this._encryptedShares;
    clone._distributedShares = this._distributedShares;
    clone._unclaimedHomeAccount = this._unclaimedHomeAccount;
    clone._homeAccountClaimed = this._homeAccountClaimed;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return clone as this;
  }

  public equals(other: NewOnboardingPayload) {
    return (
      this._multisigKey.equals(other._multisigKey) &&
      this._ownerConfirmed === other._ownerConfirmed &&
      this._name === other._name &&
      this._image === other._image &&
      this._shares === other._shares &&
      this._encryptedShares === other._encryptedShares &&
      this._distributedShares === other._distributedShares &&
      this._unclaimedHomeAccount === other._unclaimedHomeAccount &&
      this._homeAccountClaimed === other._homeAccountClaimed
    );
  }
}
