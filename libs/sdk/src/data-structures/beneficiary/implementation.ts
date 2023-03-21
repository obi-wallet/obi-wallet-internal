import R from "ramda";
import { z } from "zod";

import { BeneficiaryInterface } from "./interface";
import { BeneficiarySchema } from "./schema";
import { Duration } from "../duration";
import { AccountMetaData } from "../gatekeeper-config/account-meta-data";
import { AbstractSerialized } from "../migratable";

export class Beneficiary implements BeneficiaryInterface {
  public get schema() {
    return BeneficiarySchema;
  }

  public constructor(
    protected _meta: AbstractSerialized<typeof AccountMetaData>,
    protected _address: string,
    protected _dormancyThreshold: z.infer<typeof Duration>,
    protected _dripSchedule: {
      rate: number;
      period: z.infer<typeof Duration>;
    },
    protected _serialize: <T>(serialized: T) => T
  ) {}

  public toJSON(): AbstractSerialized<typeof BeneficiarySchema> {
    return {
      type: this.type,
      meta: this._serialize(this.meta),
      address: this.address,
      dormancyThreshold: this._serialize(this.dormancyThreshold),
      dripSchedule: this._serialize(this.dripSchedule),
    };
  }

  public equals(other: BeneficiaryInterface) {
    return R.equals(this.toJSON(), other.toJSON());
  }

  public get type() {
    return "beneficiary" as const;
  }

  public get meta() {
    return this._meta;
  }

  public get address() {
    return this._address;
  }

  public get dormancyThreshold() {
    return this._dormancyThreshold;
  }

  public setDormancyThreshold(duration: z.infer<typeof Duration>) {
    this._dormancyThreshold = duration;
  }

  public get dripSchedule() {
    return this._dripSchedule;
  }

  public setDripRate(rate: number) {
    this._dripSchedule.rate = rate;
  }

  public setDripPeriod(duration: z.infer<typeof Duration>) {
    this._dripSchedule.period = duration;
  }
}
