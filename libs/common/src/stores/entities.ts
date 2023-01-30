import { computed, makeObservable, observable } from "mobx";

export class Entities<T> {
  @observable
  protected ids: string[] = [];

  @observable
  protected _entities: Record<string, T> = {};

  constructor() {
    makeObservable(this);
  }

  @computed
  public get entities() {
    return this.ids.map((id) => this._entities[id]);
  }
}
