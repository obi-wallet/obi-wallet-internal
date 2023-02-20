import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { action, makeObservable, observable } from "mobx";

import {
  Beneficiary,
  FlexAccount,
  SerializedGatekeeperConfig,
  UnsafeBeneficiary,
} from "./serialized-data";
import { Draftable } from "../../drafts/draft";
import { Entities } from "../../entities";

export class GatekeeperConfig implements Draftable {
  @observable
  public beneficiaries: Entities<Beneficiary>;

  @observable
  public flexAccounts: Entities<FlexAccount>;

  constructor() {
    this.beneficiaries = new Entities();
    this.flexAccounts = new Entities();
    makeObservable(this);
  }

  @action
  public addBeneficiary(beneficiary: UnsafeBeneficiary) {
    pipe(
      Beneficiary.decode(beneficiary),
      E.match(
        (errors) => {
          console.error("Invalid Beneficiary", errors);
        },
        (entity) => {
          this.beneficiaries.add({
            entity,
          });
        }
      )
    );
  }

  @action
  public removeBeneficiaryByAddress({ address }: { address: string }) {
    this.beneficiaries.removeBy({
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
      beneficiaries: this.beneficiaries.entities,
      flexAccounts: this.flexAccounts.entities,
    };
  }

  public clone() {
    const clone = new GatekeeperConfig();
    clone.beneficiaries = this.beneficiaries.clone();
    return clone as this;
  }

  public equals(other: GatekeeperConfig) {
    return (
      this.beneficiaries.equals(other.beneficiaries) &&
      this.flexAccounts.equals(other.flexAccounts)
    );
  }

  public static deserialize(data: SerializedGatekeeperConfig) {
    const gatekeeperConfig = new GatekeeperConfig();
    data.beneficiaries.forEach((beneficiary) => {
      gatekeeperConfig.beneficiaries.add({ entity: beneficiary });
    });
    data.flexAccounts.forEach((flexAccount) => {
      gatekeeperConfig.flexAccounts.add({ entity: flexAccount });
    });
    return gatekeeperConfig;
  }
}
