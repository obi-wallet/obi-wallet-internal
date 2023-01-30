import { makeObservable, observable } from "mobx";

import { Draft } from "./draft";
import { Entities, EntityId } from "../entities";

export { Draft };

export class DraftsStore {
  @observable
  protected _drafts: Entities<Draft<unknown>>;

  constructor() {
    this._drafts = new Entities();
    makeObservable(this);
  }

  public create<T>({ original, id }: { original: T; id?: EntityId }) {
    const draft = new Draft<unknown>({ original });
    return this._drafts.add({ entity: draft, id });
  }

  public get<T>({ id }: { id: EntityId }) {
    return this._drafts.get({ id }) as Draft<T>;
  }
}
