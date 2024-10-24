import { KeyMetaData } from "@/stores/key-meta-data";
import { serialize } from "@obi-wallet/sdk-json";
import { action, observable, toJS } from "mobx";

export class KeyMetaDataContainer {
  @observable
  protected accessor _value: KeyMetaData;

  public constructor(value: KeyMetaData) {
    this._value = value;
  }

  public clone() {
    return new KeyMetaDataContainer({ ...this.value });
  }

  public equals(other: this): boolean {
    return serialize(toJS(this.value)) === serialize(toJS(other.value));
  }

  public get value() {
    return this._value;
  }

  @action
  public set(value: KeyMetaData) {
    this._value = value;
  }
}
