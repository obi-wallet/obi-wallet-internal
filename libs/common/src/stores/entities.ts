import { action, computed, makeObservable, observable } from "mobx";
import { nanoid } from "nanoid/non-secure";
import * as R from "ramda";

import { Draftable } from "./drafts/draft";

export type EntityId = string;

export class Entities<T> implements Draftable {
  @observable
  protected _ids: EntityId[] = [];

  @observable
  protected _entities: Record<EntityId, T> = {};

  constructor() {
    makeObservable(this);
  }

  public get ids(): readonly EntityId[] {
    return this._ids;
  }

  @computed
  public get entities(): readonly T[] {
    return this.ids.map((id) => this._entities[id]);
  }

  public get({ id }: { id: EntityId }) {
    return this._entities[id];
  }

  @action
  public add({ entity, id }: { entity: T; id?: EntityId }) {
    const idToUse = id ?? Entities.generateId();
    this._ids.push(idToUse);
    this._entities[idToUse] = entity;
    return idToUse;
  }

  @action
  public update({ entity, id }: { entity: T; id: EntityId }) {
    this._entities[id] = entity;
  }

  @action
  public removeBy({ predicate }: { predicate: (entity: T) => boolean }) {
    const idsToRemove = this._ids.filter((id) => predicate(this._entities[id]));
    idsToRemove.forEach((id) => {
      this.remove({ id });
    });
  }

  @action
  public remove({ id }: { id: EntityId }) {
    this._ids = this._ids.filter((idToKeep) => idToKeep !== id);
    this._entities = R.omit([id], this._entities);
  }

  public clone() {
    const clone = new Entities<T>();
    clone._ids = [...this._ids];
    clone._entities = { ...this._entities };
    return clone as this;
  }

  public equals(other: Entities<T>) {
    return R.equals(this.entities, other.entities);
  }

  public static generateId(): EntityId {
    return nanoid();
  }

  public static merge<T>(...entities: Entities<T>[]): Entities<T> {
    const merged = new Entities<T>();
    merged._ids = ([] as Array<string>).concat(...entities.map((e) => e._ids));
    merged._entities = R.mergeAll(entities.map((e) => e._entities));
    return merged;
  }

  public serialize(): T[] {
    return [...this.entities];
  }

  public static deserialize<T>(data: T[]): Entities<T> {
    const entities = new Entities<T>();
    data.forEach((entity) => {
      entities.add({ entity });
    });
    return entities;
  }
}
