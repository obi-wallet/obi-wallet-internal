import { makeObservable, observable } from "mobx";
import { createViewModel, IViewModel } from "mobx-utils";

export class Draft<T> {
  @observable
  protected readonly _original: T;

  @observable
  protected readonly _value: T & IViewModel<T>;

  constructor({ original }: { original: T }) {
    this._original = original;
    this._value = createViewModel(original);
    makeObservable(this);
  }

  public get value(): T {
    return this._value;
  }

  public get isDirty() {
    return this._value.isDirty;
  }
}
