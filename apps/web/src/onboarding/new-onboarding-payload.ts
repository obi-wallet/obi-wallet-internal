import { rootStore } from "@/hooks/use-create-root-store";
import { MultisigKeyEncryption, Secp256k1Encryption } from "@/lib/encryption";
import { DistributeSharesResponse } from "@/stores/mpc";
import {
  BackupShare,
  EasyShare,
  HomeChainId,
  HomeChainIdSchema,
  KeyType,
  MultisigKey,
  NetworkShare,
  ObservableMultisigKey,
} from "@obi-wallet/sdk";
import { action, observable } from "mobx";
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

export class NewOnboardingPayload {
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

  public constructor(homeChainId: HomeChainId) {
    this._multisigKey = ObservableMultisigKey.create(undefined, homeChainId);
  }

  public toJSON(): z.infer<typeof OnboardingPayloadSchema> {
    return OnboardingPayloadSchema.parse({
      homeChain: this._multisigKey.chainId,
      multisigKey: this._multisigKey.toJSON(),
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

  public async continueFlow() {
    // Can be done without owner
    await Promise.all([
      this.fetchSharesIfNecessary(),
      this.createHomeAccountIfNecessary(),
    ]);

    // Next steps require the owner
    if (!this._ownerConfirmed) return;
    await this.encryptSharesIfNecessary();
    await this.distributeSharesIfNecessary();
    await this.claimHomeAccountIfNecessary();
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
      body: JSON.stringify({
        chainId: this._multisigKey.chainId,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Failed to create magic account: ${response.status}`);
    }

    const result = UnclaimedHomeAccount.safeParse(await response.json());
    if (!result.success) {
      throw new Error(`Failed to parse magic account: ${result.error}`);
    }

    this._unclaimedHomeAccount = result.data;
  }

  protected async encryptSharesIfNecessary() {
    if (this._encryptedShares) return;
    invariant(this._shares, "Shares are not available");

    const primaryKey = this._multisigKey.getUsableKeyOfType(KeyType.Device);
    invariant(primaryKey, "Primary key is not available");

    const primaryKeyEncryption = new Secp256k1Encryption(primaryKey.publicKey);
    const multisigKeyEncryption = new MultisigKeyEncryption(
      this._multisigKey.publicKey,
    );
    const [easyShare, backupShare] = await Promise.all([
      primaryKeyEncryption.encrypt(JSON.stringify(this._shares.easyShare)),
      multisigKeyEncryption.encrypt(JSON.stringify(this._shares.backupShare)),
    ]);
    this._encryptedShares = {
      easyShare,
      backupShare,
    };
  }

  protected async distributeSharesIfNecessary() {
    if (this._distributedShares) return;
    invariant(this._shares, "Shares are not available");
    invariant(this._encryptedShares, "Shares are not encrypted");
    invariant(this._unclaimedHomeAccount, "Home account is not available");

    const response = await fetch("/api/setup/distribute-shares", {
      method: "POST",
      body: JSON.stringify({
        chainId: this._multisigKey.chainId,
        backupShare: this._encryptedShares.backupShare,
        networkParticipants: this._shares.networkParticipants,
        networkShare: this._shares.networkShare,
        homeAccountAddress: this._unclaimedHomeAccount.homeAccountAddress,
        ownerAddress: this._unclaimedHomeAccount.ownerAddress,
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

    const response = await fetch("/api/setup/first-update-owner", {
      method: "POST",
      body: JSON.stringify({
        owner: this._multisigKey,
        ownerAddress: this._multisigKey.address,
        ownerIndex: this._unclaimedHomeAccount.ownerIndex,
        homeAccountAddress: this._unclaimedHomeAccount.homeAccountAddress,
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
      undefined,
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
}
