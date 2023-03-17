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

  public static empty(): GatekeeperConfig {
    return new GatekeeperConfig([], []);
  }

  public static deserialize(
    serialized: AbstractMigratable<typeof GatekeeperConfigSchema>
  ): GatekeeperConfig {
    const { beneficiaries, flexAccounts } =
      GatekeeperConfigSchema.migratableSchema.parse(serialized);
    return new GatekeeperConfig(beneficiaries, flexAccounts);
  }

  public get beneficiaries() {
    return [...this._beneficiaries];
  }

  public get flexAccounts() {
    return [...this._flexAccounts];
  }

  public upsertBeneficiary(
    beneficiary: AbstractSerialized<typeof Beneficiary>
  ) {
    return new GatekeeperConfig(
      this.upsertArrayItem(this._beneficiaries, beneficiary),
      this._flexAccounts
    );
  }

  public removeBeneficiaryByAddress({ address }: { address: string }) {
    return new GatekeeperConfig(
      this._beneficiaries.filter(
        (beneficiary) => beneficiary.address !== address
      ),
      this._flexAccounts
    );
  }

  public upsertFlexAccount(
    flexAccount: AbstractSerialized<typeof FlexAccount>
  ) {
    return new GatekeeperConfig(
      this._beneficiaries,
      this.upsertArrayItem(this._flexAccounts, flexAccount)
    );
  }

  public removeFlexAccountByAddress({ address }: { address: string }) {
    return new GatekeeperConfig(
      this._beneficiaries,
      this._flexAccounts.filter(
        (flexAccount) => flexAccount.address !== address
      )
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
