import { action, computed, makeObservable, observable } from "mobx";
import { nanoid } from "nanoid/non-secure";
import * as R from "ramda";

import { Draftable } from "./drafts/draft";

export type EntityId = string;

export class Entities<T> implements Draftable {
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

  @action
  public removeBy({ predicate }: { predicate: (entity: T) => boolean }) {
    const idsToRemove = this.ids.filter((id) => predicate(this._entities[id]));
    idsToRemove.forEach((id) => {
      this.remove({ id });
    });
  }

  @action
  public remove({ id }: { id: EntityId }) {
    this.ids = this.ids.filter((idToKeep) => idToKeep !== id);
    this._entities = R.omit([id], this._entities);
  }

  public clone() {
    const clone = new Entities<T>();
    clone.ids = [...this.ids];
    clone._entities = { ...this._entities };
    return clone as this;
  }

  public equals(other: Entities<T>) {
    return R.equals(this.entities, other.entities);
  }

  protected generateId(): EntityId {
    return nanoid();
  }
}
