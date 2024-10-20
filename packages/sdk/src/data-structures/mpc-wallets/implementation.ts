import { uniqBy } from "ramda";

import { LegacyMpcWalletsSchema } from "./schema";
import { AbstractMigratable, AbstractSerialized } from "../migratable";
import { MpcWallet } from "../mpc-wallet";

export class MpcWallets {
  public get schema() {
    return LegacyMpcWalletsSchema;
  }

  public constructor(
    protected _wallets: MpcWallet[],
    protected _currentWalletIndex: number | null,
    protected _factory: typeof MpcWallet,
    protected _serialize: <T>(serialized: T) => T,
  ) {}

  public toJSON(): AbstractSerialized<typeof LegacyMpcWalletsSchema> {
    return {
      wallets: this._wallets.map((w) => {
        return w.toJSON();
      }),
      currentWalletIndex: this._currentWalletIndex,
    };
  }

  public deserialize(
    migratable: AbstractMigratable<typeof LegacyMpcWalletsSchema>,
  ) {
    const serialized =
      LegacyMpcWalletsSchema.migratableSchema.parse(migratable);
    const serializedWallets = uniqBy((wallet) => {
      return wallet.userEntryAddress;
    }, serialized.wallets);
    this._wallets = serializedWallets.map((w) => {
      return this._factory.create(w);
    });
    this._currentWalletIndex = serialized.currentWalletIndex;
  }

  public get wallets() {
    return this._wallets;
  }

  protected get currentWalletIndex() {
    return this._currentWalletIndex;
  }

  public get currentWallet() {
    if (typeof this.currentWalletIndex !== "number") return null;
    return this._wallets[this.currentWalletIndex];
  }

  public setCurrentWallet(wallet: MpcWallet) {
    const index = this._wallets.findIndex((w) => {
      return w.userEntryAddress === wallet.userEntryAddress;
    });
    if (index !== -1) {
      this._currentWalletIndex = index;
    }
  }

  public logout() {
    this._currentWalletIndex = null;
  }

  public getWalletByUserEntryAddress(userEntryAddress: string) {
    return this._wallets.find((w) => {
      return w.userEntryAddress === userEntryAddress;
    });
  }

  public upsertWallet(wallet: MpcWallet) {
    const existingWallet = this.getWalletByUserEntryAddress(
      wallet.userEntryAddress,
    );
    if (existingWallet) {
      this.removeWallet(existingWallet);
    }
    this._wallets.push(wallet);
    this.setCurrentWallet(wallet);
  }

  public removeWallet(wallet: MpcWallet) {
    this._wallets = this._wallets.filter((w) => {
      return w.userEntryAddress !== wallet.userEntryAddress;
    });
  }
}
