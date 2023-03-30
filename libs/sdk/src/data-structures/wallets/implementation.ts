import { WalletsSchema } from "./schema";
import { AbstractSerialized } from "../migratable";
import { MultisigWallet } from "../multisig-wallet";

export class Wallets {
  public get schema() {
    return WalletsSchema;
  }

  public constructor(
    protected _wallets: MultisigWallet[],
    protected _currentWalletIndex: number | null
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

  public upsertWallet(wallet: MultisigWallet) {
    this._wallets.push(wallet);
    this.setCurrentWallet(wallet);
  }

  public removeWallet(wallet: MultisigWallet) {
    this._wallets = this._wallets.filter((w) => w.id !== wallet.id);
  }
}
