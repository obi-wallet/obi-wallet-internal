import * as E from "fp-ts/Either";
import { action, computed, makeObservable, observable } from "mobx";

import {
  Beneficiary,
  FlexAccount,
  SerializedGatekeeperConfig,
} from "./serialized-data";
import { Draftable } from "../../drafts/draft";
import { Entities } from "../../entities";
import { ArrayIndex } from "../../helpers";

export class GatekeeperConfig implements Draftable {
  @observable
  protected _beneficiaries: Entities<Beneficiary>;

  @observable
  protected _flexAccounts: Entities<FlexAccount>;
  @observable
  protected currentFlexAccountId: string | null = null;

  constructor() {
    this._beneficiaries = new Entities();
    this._flexAccounts = new Entities();
    makeObservable(this);
  }

  public get beneficiaries() {
    return this._beneficiaries.entities;
  }

  public get flexAccounts() {
    return this._flexAccounts.entities;
  }

  public get currentFlexAccount() {
    if (this.currentFlexAccountId === null) return null;
    return this._flexAccounts.get({ id: this.currentFlexAccountId });
  }

  @computed
  public get currentFlexAccountIndex() {
    if (this.currentFlexAccountId === null) return null;
    const index = this._flexAccounts.ids.indexOf(this.currentFlexAccountId);
    return E.getOrElseW(() => null)(ArrayIndex.decode(index));
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
    this._flexAccounts.add({
      entity: flexAccount,
    });
  }

  @action
  public removeFlexAccountByAddress({ address }: { address: string }) {
    this._flexAccounts.removeBy({
      predicate(flexAccount) {
        return flexAccount.address === address;
      },
    });
  }

  public serialize(): SerializedGatekeeperConfig {
    return {
      beneficiaries: this.beneficiaries,
      flexAccounts: this.flexAccounts,
      currentFlexAccountIndex: this.currentFlexAccountIndex,
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
      this._flexAccounts.equals(other._flexAccounts)
    );
  }

  public static deserialize(data: SerializedGatekeeperConfig) {
    const gatekeeperConfig = new GatekeeperConfig();
    data.beneficiaries.forEach((beneficiary) => {
      gatekeeperConfig._beneficiaries.add({ entity: beneficiary });
    });
    data.flexAccounts.forEach((flexAccount) => {
      gatekeeperConfig._flexAccounts.add({ entity: flexAccount });
    });
    return gatekeeperConfig;
  }
}
