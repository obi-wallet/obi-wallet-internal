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
    protected _flexAccounts: AbstractSerialized<typeof FlexAccount>[],
    protected _factory: (
      serialized: AbstractSerialized<typeof GatekeeperConfigSchema>
    ) => GatekeeperConfig
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
    return this._factory(this.toJSON());
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

export function createGatekeeperConfig(
  serialized: AbstractMigratable<typeof GatekeeperConfigSchema> = {
    beneficiaries: [],
    flexAccounts: [],
  },
  factory = createGatekeeperConfig
) {
  const { beneficiaries, flexAccounts } =
    GatekeeperConfigSchema.migratableSchema.parse(serialized);
  return new GatekeeperConfig(beneficiaries, flexAccounts, factory);
}

export function createObservableGatekeeperConfig(
  serialized?: AbstractMigratable<typeof GatekeeperConfigSchema>
) {
  const config = createGatekeeperConfig(
    serialized,
    createObservableGatekeeperConfig
  );
  makeObservable<GatekeeperConfig, "_beneficiaries" | "_flexAccounts">(
    config,
    {
      _beneficiaries: observable,
      _flexAccounts: observable,
      toJSON: false,
      clone: false,
      upsertBeneficiary: action,
      removeBeneficiaryByAddress: action,
      upsertFlexAccount: action,
      removeFlexAccountByAddress: action,
    },
    {
      name: "GatekeeperConfig",
    }
  );
  return config;
}
