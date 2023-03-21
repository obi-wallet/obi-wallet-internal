import * as R from "ramda";

import { SinglesigWalletInterface } from "./interface";
import { SinglesigWalletSchema } from "./schema";
import { Secp256k1KeyPair } from "../../keys";
import { AbstractSerialized } from "../migratable";

export class SinglesigWallet implements SinglesigWalletInterface {
  public get schema() {
    return SinglesigWalletSchema;
  }

  public constructor(protected _keyPair: Secp256k1KeyPair) {}

  public toJSON(): AbstractSerialized<typeof SinglesigWalletSchema> {
    return {
      type: this.type,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
    };
  }

  public equals(other: SinglesigWalletInterface) {
    return R.equals(this.toJSON(), other.toJSON());
  }

  public get type() {
    return "singlesig-wallet" as const;
  }

  public get publicKey() {
    return this._keyPair.publicKey;
  }

  public get privateKey() {
    return this._keyPair.privateKey;
  }
}
