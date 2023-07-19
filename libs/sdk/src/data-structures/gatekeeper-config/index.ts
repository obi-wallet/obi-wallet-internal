import { action, makeObservable, observable } from "mobx";
import * as R from "ramda";
import { z } from "zod";

import { Beneficiary, ObservableBeneficiary } from "../beneficiary";
import { FlexAccount, ObservableFlexAccount } from "../flex-account";
import {
  AbstractMigratable,
  AbstractSerialized,
  migratable,
} from "../migratable";

const GatekeeperConfigSchema = migratable(
  z.object({
    beneficiaries: z.array(Beneficiary.schema.migratableSchema),
    flexAccounts: z.array(FlexAccount.schema.migratableSchema),
  }),
);

export class GatekeeperConfig {
  public static get schema() {
    return GatekeeperConfigSchema;
  }

  public constructor(
    protected _beneficiaries: Beneficiary[],
    protected _flexAccounts: FlexAccount[],
    protected _factory: (
      serialized: AbstractSerialized<typeof GatekeeperConfigSchema>,
    ) => GatekeeperConfig,
  ) {}

  public toJSON(): AbstractSerialized<typeof GatekeeperConfigSchema> {
    return {
      beneficiaries: this._beneficiaries.map((b) => b.toJSON()),
      flexAccounts: this._flexAccounts.map((f) => f.toJSON()),
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

  public upsertBeneficiary(beneficiary: Beneficiary) {
    this._beneficiaries = this.upsertArrayItem(
      this._beneficiaries,
      beneficiary,
    );
  }

  public removeBeneficiary(beneficiary: Beneficiary) {
    this._beneficiaries = this._beneficiaries.filter(
      (b) => b.address !== beneficiary.address,
    );
  }

  public upsertFlexAccount(flexAccount: FlexAccount) {
    this._flexAccounts = this.upsertArrayItem(this._flexAccounts, flexAccount);
  }

  public removeFlexAccount(flexAccount: FlexAccount) {
    this._flexAccounts = this._flexAccounts.filter(
      (f) => f.address !== flexAccount.address,
    );
  }

  protected upsertArrayItem<T extends { address: string }>(
    array: T[],
    item: T,
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
  factories = {
    createGatekeeperConfig,
    Beneficiary,
    FlexAccount,
  },
) {
  const { beneficiaries, flexAccounts } =
    GatekeeperConfigSchema.migratableSchema.parse(serialized);
  return new GatekeeperConfig(
    beneficiaries.map((b) => factories.Beneficiary.create(b)),
    flexAccounts.map((b) => factories.FlexAccount.create(b)),
    factories.createGatekeeperConfig,
  );
}

export function createObservableGatekeeperConfig(
  serialized?: AbstractMigratable<typeof GatekeeperConfigSchema>,
) {
  const config = createGatekeeperConfig(serialized, {
    createGatekeeperConfig: createObservableGatekeeperConfig,
    Beneficiary: ObservableBeneficiary,
    FlexAccount: ObservableFlexAccount,
  });
  makeObservable<GatekeeperConfig, "_beneficiaries" | "_flexAccounts">(
    config,
    {
      _beneficiaries: observable,
      _flexAccounts: observable,
      toJSON: false,
      clone: false,
      upsertBeneficiary: action,
      removeBeneficiary: action,
      upsertFlexAccount: action,
      removeFlexAccount: action,
    },
    {
      name: "GatekeeperConfig",
    },
  );
  return config;
}
