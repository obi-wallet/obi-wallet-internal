import { WalletsSchema } from "./schema";
import { ChainId } from "../../chains";
import { WalletsSdk } from "../../sdk/wallets";
import { Serialized } from "../abstract";
import { createGatekeeperConfig } from "../gatekeeper-config";
import { AbstractMigratable, AbstractSerialized } from "../migratable";
import { MultisigKey } from "../multisig-key";
import { MultisigWallet } from "../multisig-wallet";

export class Wallets {
  public get schema() {
    return WalletsSchema;
  }

  public constructor(
    protected _wallets: MultisigWallet[],
    protected _currentChainId: ChainId | null,
    protected _currentWalletIndexPerChain: Partial<
      Record<ChainId, number | null>
    >,
    protected _factory: typeof MultisigWallet,
    protected _serialize: <T>(serialized: T) => T,
  ) {}

  public toJSON(): AbstractSerialized<typeof WalletsSchema> {
    return {
      wallets: this._wallets.map((w) => w.toJSON()),
      currentChainId: this._currentChainId,
      currentWalletIndexPerChain: this._serialize(
        this._currentWalletIndexPerChain,
      ),
    };
  }

  public deserialize(migratable: AbstractMigratable<typeof WalletsSchema>) {
    const serialized = WalletsSchema.migratableSchema.parse(migratable);
    this._wallets = serialized.wallets.map((w) => this._factory.create(w));
    this._currentChainId = serialized.currentChainId;
    this._currentWalletIndexPerChain = serialized.currentWalletIndexPerChain;
  }

  public get wallets() {
    return this._wallets;
  }

  public get currentChainId() {
    return this._currentChainId;
  }

  public setCurrentChain(chainId: ChainId) {
    this._currentChainId = chainId;
  }

  protected get currentWalletIndex() {
    if (!this._currentChainId) return null;
    return this._currentWalletIndexPerChain?.[this._currentChainId] ?? null;
  }

  public get currentWallet() {
    if (typeof this.currentWalletIndex !== "number") return null;
    return this._wallets[this.currentWalletIndex];
  }

  public get address(): string | null {
    return this.currentWallet?.address ?? null;
  }

  public setCurrentWallet(wallet: MultisigWallet) {
    const index = this._wallets.findIndex((w) => w.id === wallet.id);
    if (index !== -1) {
      this._currentChainId = wallet.chainId;
      this._currentWalletIndexPerChain[wallet.chainId] = index;
    }
  }

  public logout() {
    if (!this._currentChainId) return;
    delete this._currentWalletIndexPerChain[this._currentChainId];
  }

  public getWalletByProxyAddress(proxyAddress: string) {
    return this._wallets.find((w) => w.proxyAddress === proxyAddress);
  }

  public async createWallet({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }) {
    const response = await this.walletsSdk.createWallet({
      multisigKey,
      demoMode,
    });
    if (!response.approved || !response.payload.success) return response;
    const wallet = this._factory.create({
      type: demoMode ? "multisig-demo" : "multisig",
      data: {
        chain: multisigKey.chainId,
        gatekeeperConfig: createGatekeeperConfig().toJSON(),
        owner: multisigKey.toJSON(),
        proxyAddress: {
          v: 1,
          address: response.payload.proxyAddress,
        },
        singlesigWallets: [],
        currentAccount: null,
      },
    });
    this.upsertWallet(wallet);
    return response;
  }

  public async recoverWallet({
    serializedData,
    newOwner,
  }: {
    serializedData: Serialized<MultisigWallet>["data"];
    newOwner: MultisigKey;
  }) {
    const wallet = this._factory.create({
      type: "multisig",
      data: serializedData,
    });
    const response = await wallet.updateOwner(newOwner);
    if (response.approved && response.payload.success) {
      this.upsertWallet(wallet);
    }
    return response;
  }

  public upsertWallet(wallet: MultisigWallet) {
    this._wallets.push(wallet);
    this.setCurrentWallet(wallet);
  }

  public removeWallet(wallet: MultisigWallet) {
    this._wallets = this._wallets.filter((w) => w.id !== wallet.id);
  }

  protected get walletsSdk() {
    return new WalletsSdk();
  }
}
