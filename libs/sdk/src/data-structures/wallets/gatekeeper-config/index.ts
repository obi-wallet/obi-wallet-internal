import { action, makeObservable, observable } from "mobx";
import * as R from "ramda";
import { z } from "zod";

import { Beneficiary } from "./beneficiary";
import { FlexAccount } from "./flex-account";
import { AbstractMigratable, AbstractSerialized } from "../../abstract";
import { migratable } from "../../migratable";

export { Beneficiary, FlexAccount };

const GatekeeperConfigSchema = migratable(
  z.object({
    beneficiaries: z.array(Beneficiary.migratableSchema),
    flexAccounts: z.array(FlexAccount.migratableSchema),
  })
);

export class GatekeeperConfig {
  public static get schema() {
    return GatekeeperConfigSchema;
  }

  public constructor(
    protected _beneficiaries: AbstractSerialized<typeof Beneficiary>[],
    protected _flexAccounts: AbstractSerialized<typeof FlexAccount>[]
  ) {}

  public toJSON(): AbstractSerialized<typeof GatekeeperConfigSchema> {
    return {
      beneficiaries: this._beneficiaries,
      flexAccounts: this._flexAccounts,
    };
  }

  public equals(other: GatekeeperConfig) {
    return R.equals(this.toJSON(), other.toJSON());
  }

  public clone() {
    return GatekeeperConfig.deserialize(this.toJSON()) as this;
  }

  public static empty(): GatekeeperConfig {
    return new GatekeeperConfig(...this.emptyConstructorParameters());
  }

  protected static emptyConstructorParameters(): ConstructorParameters<
    typeof GatekeeperConfig
  > {
    return [[], []];
  }

  public static deserialize(
    serialized: AbstractMigratable<typeof GatekeeperConfigSchema>
  ): GatekeeperConfig {
    return new GatekeeperConfig(
      ...this.deserializeConstructorParameters(serialized)
    );
  }

  protected static deserializeConstructorParameters(
    serialized: AbstractMigratable<typeof GatekeeperConfigSchema>
  ): ConstructorParameters<typeof GatekeeperConfig> {
    const { beneficiaries, flexAccounts } =
      GatekeeperConfigSchema.migratableSchema.parse(serialized);
    return [beneficiaries, flexAccounts];
  }

  public get beneficiaries() {
    return this._beneficiaries;
  }

  public get flexAccounts() {
    return this._flexAccounts;
  }

  public upsertBeneficiary(
    beneficiary: AbstractSerialized<typeof Beneficiary>
  ) {
    this._beneficiaries = this.upsertArrayItem(
      this._beneficiaries,
      beneficiary
    );
  }

  public removeBeneficiaryByAddress({ address }: { address: string }) {
    this._beneficiaries = this._beneficiaries.filter(
      (beneficiary) => beneficiary.address !== address
    );
  }

  public upsertFlexAccount(
    flexAccount: AbstractSerialized<typeof FlexAccount>
  ) {
    this._flexAccounts = this.upsertArrayItem(this._flexAccounts, flexAccount);
  }

  public removeFlexAccountByAddress({ address }: { address: string }) {
    this._flexAccounts = this._flexAccounts.filter(
      (flexAccount) => flexAccount.address !== address
    );
  }

  protected upsertArrayItem<T extends { address: string }>(
    array: T[],
    item: T
  ) {
    const result = [...array];
    const index = result.findIndex((b) => b.address === item.address);
    if (index === -1) {
      result.push(item);
    } else {
      result[index] = item;
    }
    return result;
  }
}

export class ObservableGatekeeperConfig extends GatekeeperConfig {
  public constructor(...args: ConstructorParameters<typeof GatekeeperConfig>) {
    super(...args);
    makeObservable<
      ObservableGatekeeperConfig,
      "_beneficiaries" | "_flexAccounts"
    >(
      this,
      {
        _beneficiaries: observable,
        _flexAccounts: observable,
        upsertBeneficiary: action,
        removeBeneficiaryByAddress: action,
        upsertFlexAccount: action,
        removeFlexAccountByAddress: action,
      },
      {
        name: "GatekeeperConfig",
      }
    );
  }

  public static empty(): ObservableGatekeeperConfig {
    return new ObservableGatekeeperConfig(...this.emptyConstructorParameters());
  }

  public static deserialize(
    serialized: AbstractMigratable<typeof GatekeeperConfigSchema>
  ): ObservableGatekeeperConfig {
    return new ObservableGatekeeperConfig(
      ...this.deserializeConstructorParameters(serialized)
    );
  }
}
