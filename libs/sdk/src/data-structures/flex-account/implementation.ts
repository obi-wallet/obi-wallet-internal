import { DateTime } from "luxon";
import * as R from "ramda";
import { z } from "zod";

import { FlexAccountInterface } from "./interface";
import { AutoSign, FlexAccountSchema, SpendLimit } from "./schema";
import { Secp256k1PublicKey } from "../../keys";
import { AccountMetaData } from "../gatekeeper-config/account-meta-data";
import { AbstractSerialized } from "../migratable";

export class FlexAccount implements FlexAccountInterface {
  public get schema() {
    return FlexAccountSchema;
  }

  public constructor(
    protected _meta: AbstractSerialized<typeof AccountMetaData>,
    protected _address: string,
    protected _publicKey: Secp256k1PublicKey,
    protected _privateKey: string,
    protected _spendLimit: z.infer<typeof SpendLimit> | null,
    protected _autoSign: z.infer<typeof AutoSign> | null,
    protected _serialize: <T>(serialized: T) => T
  ) {}

  public toJSON(): AbstractSerialized<typeof FlexAccountSchema> {
    return {
      type: this.type,
      meta: this._serialize(this.meta),
      address: this.address,
      publicKey: this._serialize(this.publicKey),
      privateKey: this.privateKey,
      spendLimit: this._serialize(this.spendLimit),
      autoSign: this._serialize(this.autoSign),
    };
  }

  public equals(other: FlexAccountInterface) {
    return R.equals(
      R.omit(["autoSign"], this.toJSON()),
      R.omit(["autoSign"], other.toJSON())
    );
  }

  public get type() {
    return "flex-account" as const;
  }

  public get meta() {
    return this._meta;
  }

  public get address() {
    return this._address;
  }

  public get publicKey() {
    return this._publicKey;
  }

  public get privateKey() {
    return this._privateKey;
  }

  public get spendLimit() {
    return this._spendLimit;
  }

  public setSpendLimit(spendLimit: z.infer<typeof SpendLimit> | null) {
    this._spendLimit = spendLimit;
  }

  public get hasActiveAutoSign() {
    return !!this.remainingAutoSignDuration;
  }

  public get remainingAutoSignDuration() {
    if (!this._autoSign) return null;
    const remainingTime = DateTime.fromISO(this._autoSign.endTime).diff(
      DateTime.now(),
      "seconds"
    );
    return remainingTime.toMillis() >= 0 ? remainingTime : null;
  }

  public get autoSignEndTime() {
    if (!this.autoSign) return null;
    return DateTime.fromISO(this.autoSign.endTime);
  }

  protected get autoSign() {
    if (!this.hasActiveAutoSign) return null;
    return this._autoSign;
  }

  public enableAutoSign(endTime: DateTime) {
    this._autoSign = { endTime: endTime.toISO() };
  }

  public clearAutoSign() {
    this._autoSign = null;
  }
}
