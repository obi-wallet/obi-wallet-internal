import { action, computed, makeObservable, observable } from "mobx";

export enum Brand {
  OBI = "obi",
  LOOP = "loop",
}
export class SettingsStore {
  @observable
  public brand = Brand.LOOP;
  constructor() {
    makeObservable(this);
  }
  @action
  public toggleBrand() {
    this.brand = this.brand === Brand.LOOP ? Brand.OBI : Brand.LOOP;
  }

  public isObi() {
    return this.brand === Brand.OBI;
  }

  public isLoop() {
    return this.brand === Brand.LOOP;
  }
  @action
  public setBrand(brand: Brand) {
    this.brand = brand;
  }
}
