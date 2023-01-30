import { action, computed, makeObservable, observable } from "mobx";
import { nanoid } from "nanoid/non-secure";

export type EntityId = string;

export class Entities<T> {
  @observable
  protected ids: EntityId[] = [];

  @observable
  protected _entities: Record<EntityId, T> = {};

  constructor() {
    makeObservable(this);
  }

  @computed
  public get entities() {
    return this.ids.map((id) => this._entities[id]);
  }

  public get({ id }: { id: EntityId }) {
    return this._entities[id];
  }

  @action
  public add({ entity, id }: { entity: T; id?: EntityId }) {
    const idToUse = id ?? this.generateId();
    this.ids.push(idToUse);
    this._entities[idToUse] = entity;
    return idToUse;
  }

  protected generateId(): EntityId {
    return nanoid();
  }
}
