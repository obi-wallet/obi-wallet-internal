import { action, makeObservable, observable } from "mobx";

import { Draft, Draftable } from "./draft";
import { Entities, EntityId } from "../entities";

export { Draft };

export class DraftsStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _drafts: Entities<any>;

  constructor() {
    this._drafts = new Entities();
    makeObservable<DraftsStore, "_drafts">(this, {
      create: action,
      get: false,
      _drafts: observable,
    });
  }

  public create<T extends Draftable>({
    original,
    value,
    id,
  }: {
    original: T;
    value?: T;
    id?: EntityId;
  }) {
    const draft = new Draft({ original, value });
    return this._drafts.add({ entity: draft, id });
  }

  public get<T extends Draftable>({ id }: { id: EntityId }) {
    return this._drafts.get({ id }) as Draft<T> | undefined;
  }
}
