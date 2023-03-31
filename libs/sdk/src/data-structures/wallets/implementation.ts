import { WalletsSchema } from "./schema";
import { Sdk } from "../../sdk";
import { createGatekeeperConfig } from "../gatekeeper-config";
import { AbstractSerialized } from "../migratable";
import { MultisigKey } from "../multisig-key";
import { MultisigWallet } from "../multisig-wallet";

export class Wallets {
  public get schema() {
    return WalletsSchema;
  }

  public constructor(
    protected _wallets: MultisigWallet[],
    protected _currentWalletIndex: number | null,
    protected _factory: typeof MultisigWallet
  ) {}

  public toJSON(): AbstractSerialized<typeof WalletsSchema> {
    return {
      wallets: this._wallets.map((w) => w.toJSON()),
      currentWalletIndex: this._currentWalletIndex,
    };
  }

  public get wallets() {
    return this._wallets;
  }

  public get currentWallet() {
    if (typeof this._currentWalletIndex !== "number") return null;
    return this._wallets[this._currentWalletIndex];
  }

  public setCurrentWallet(wallet: MultisigWallet) {
    const index = this._wallets.findIndex((w) => w.id === wallet.id);
    if (index !== -1) {
      this._currentWalletIndex = index;
    }
  }

  public logout() {
    this._currentWalletIndex = null;
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
    const sdk = Sdk.chainId(multisigKey.chainId);
    const response = await sdk.createWallet({ multisigKey, demoMode });
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

  public upsertWallet(wallet: MultisigWallet) {
    this._wallets.push(wallet);
    this.setCurrentWallet(wallet);
  }

  public removeWallet(wallet: MultisigWallet) {
    this._wallets = this._wallets.filter((w) => w.id !== wallet.id);
  }
}
