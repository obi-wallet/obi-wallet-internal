import { makeObservable, observable } from "mobx";
import * as R from "ramda";

import { Draftable } from "./draft";

export class DraftableObject<T> implements Draftable {
  @observable
  public value: T;

  constructor(value: T) {
    this.value = value;
    makeObservable(this);
  }

  public clone() {
    return new DraftableObject<T>(R.clone(this.value)) as this;
  }

  public equals(other: DraftableObject<T>): boolean {
    return R.equals(this.value, other.value);
  }
}
