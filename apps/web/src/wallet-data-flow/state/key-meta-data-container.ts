import { Draftable } from "@/stores/drafts/draft";
import { KeyMetaData } from "@/stores/key-meta-data";
import { serialize } from "@obi-wallet/sdk-json";
import { action, observable, toJS } from "mobx";

export class KeyMetaDataContainer implements Draftable {
  @observable
  protected accessor _value: KeyMetaData;

  public constructor(value: KeyMetaData) {
    this._value = value;
  }

  public clone() {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return new KeyMetaDataContainer({ ...this.value }) as this;
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
