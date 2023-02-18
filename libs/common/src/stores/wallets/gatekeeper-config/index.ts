import { action, makeObservable, observable } from "mobx";

import { Beneficiary, SerializedGatekeeperConfig } from "./serialized-data";
import { Draftable } from "../../drafts/draft";
import { Entities } from "../../entities";

export class GatekeeperConfig implements Draftable {
  @observable
  protected _beneficiaries: Entities<Beneficiary>;

  constructor() {
    this._beneficiaries = new Entities();
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

  public serialize(): SerializedGatekeeperConfig {
    return {
      beneficiaries: this.beneficiaries,
    };
  }

  public clone() {
    const clone = new GatekeeperConfig();
    clone._beneficiaries = this._beneficiaries.clone();
    return clone as this;
  }

  public equals(other: GatekeeperConfig) {
    return this._beneficiaries.equals(other._beneficiaries);
  }

  public static deserialize(data: SerializedGatekeeperConfig) {
    const gatekeeperConfig = new GatekeeperConfig();
    data.beneficiaries.forEach((beneficiary) => {
      gatekeeperConfig._beneficiaries.add({ entity: beneficiary });
    });
    return gatekeeperConfig;
  }
}
