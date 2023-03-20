import { WalletsInterface } from "./interface";
import { WalletsSchema } from "./schema";
import { AbstractDataStructure, Serialized } from "../abstract";
import { AbstractSerialized } from "../migratable";
import { MultisigWallet } from "../multisig-wallet";

export class Wallets implements WalletsInterface {
  public get schema() {
    return WalletsSchema;
  }

  public constructor(
    protected _wallets: MultisigWallet[],
    protected _currentWalletIndex: number | null,
    protected _MultisigWallet: AbstractDataStructure<MultisigWallet>
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

  public getWallet(id: string) {
    return this._wallets.find((w) => w.id === id);
  }

  public upsertWallet(serialized: Serialized<MultisigWallet>) {
    const wallet = this._MultisigWallet.create(serialized);
    this._wallets.push(wallet);
    this.setCurrentWallet(wallet);
    return wallet;
  }

  public removeWallet(wallet: MultisigWallet) {
    this._wallets = this._wallets.filter((w) => w.id !== wallet.id);
  }
}
