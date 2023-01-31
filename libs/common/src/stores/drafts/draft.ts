import { makeObservable, observable } from "mobx";

export interface Draftable {
  clone(): this;
  equals(other: this): boolean;
}

export class Draft<T extends Draftable> {
  @observable
  protected readonly _original: T;

  @observable
  protected readonly _value: T;

  constructor({ original }: { original: T }) {
    this._original = original;
    this._value = original.clone();
    makeObservable(this);
  }

  public get value(): T {
    return this._value;
  }

  public get isDirty() {
    return !this._original.equals(this._value);
  }
}
