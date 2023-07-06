import { action, makeObservable, observable } from "mobx";

export interface Draftable {
  clone(): this;
  equals(other: this): boolean;
}

export class Draft<T extends Draftable> {
  protected _original: T;

  protected _value: T;

  constructor({ original, value }: { original: T; value?: T }) {
    this._original = original;
    this._value = value ?? original.clone();
    makeObservable<Draft<T>, "_original" | "_value">(this, {
      original: false,
      value: false,
      isDirty: false,
      _original: observable,
      _value: observable,
      reset: action,
      commit: action,
    });
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

  public reset() {
    this._value = this._original.clone();
  }

  public commit({ original }: { original: T }) {
    this._original = original;
    this.reset();
  }
}
