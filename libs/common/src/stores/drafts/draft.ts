import { action, makeObservable, observable } from "mobx";

export interface Draftable {
  clone(): this;
  equals(other: this): boolean;
}

export class Draft<T extends Draftable> {
  @observable
  protected _original: T;

  @observable
  protected _value: T;

  constructor({ original, value }: { original: T; value?: T }) {
    this._original = original;
    this._value = value ?? original.clone();
    makeObservable(this);
  }

  public get original() {
    return this._original;
  }

  public get value() {
    return this._value;
  }

  public get isDirty() {
    return !this._original.equals(this._value);
  }

  @action
  public reset() {
    this._value = this._original.clone();
  }

  @action
  public commit({ original }: { original: T }) {
    this._original = original;
    this.reset();
  }
}
