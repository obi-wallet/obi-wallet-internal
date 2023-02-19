import { action, makeObservable, observable } from "mobx";

import {
  Beneficiary,
  FlexAccount,
  SerializedGatekeeperConfig,
} from "./serialized-data";
import { Draftable } from "../../drafts/draft";
import { Entities } from "../../entities";

export class GatekeeperConfig implements Draftable {
  @observable
  protected _beneficiaries: Entities<Beneficiary>;

  @observable
  public flexAccounts: Entities<FlexAccount>;

  constructor() {
    this._beneficiaries = new Entities();
    this.flexAccounts = new Entities();
    makeObservable(this);
  }

  public get beneficiaries() {
    return this._beneficiaries.entities;
  }

  @action
  public addBeneficiary(beneficiary: Beneficiary) {
    this._beneficiaries.add({
      entity: beneficiary,
    });
  }

  @action
  public removeBeneficiaryByAddress({ address }: { address: string }) {
    this._beneficiaries.removeBy({
      predicate(beneficiary) {
        return beneficiary.address === address;
      },
    });
  }

  @action
  public addFlexAccount(flexAccount: FlexAccount) {
    this.flexAccounts.add({
      entity: flexAccount,
    });
  }

  @action
  public removeFlexAccountByAddress({ address }: { address: string }) {
    this.flexAccounts.removeBy({
      predicate(flexAccount) {
        return flexAccount.address === address;
      },
    });
  }

  public serialize(): SerializedGatekeeperConfig {
    return {
      beneficiaries: this.beneficiaries,
      flexAccounts: this.flexAccounts.entities,
    };
  }

  public clone() {
    const clone = new GatekeeperConfig();
    clone._beneficiaries = this._beneficiaries.clone();
    return clone as this;
  }

  public equals(other: GatekeeperConfig) {
    return (
      this._beneficiaries.equals(other._beneficiaries) &&
      this.flexAccounts.equals(other.flexAccounts)
    );
  }

  public static deserialize(data: SerializedGatekeeperConfig) {
    const gatekeeperConfig = new GatekeeperConfig();
    data.beneficiaries.forEach((beneficiary) => {
      gatekeeperConfig._beneficiaries.add({ entity: beneficiary });
    });
    data.flexAccounts.forEach((flexAccount) => {
      gatekeeperConfig.flexAccounts.add({ entity: flexAccount });
    });
    return gatekeeperConfig;
  }
}
