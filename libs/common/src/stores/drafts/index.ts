import { makeObservable, observable } from "mobx";

import { Draft, Draftable } from "./draft";
import { Entities, EntityId } from "../entities";

export { Draft };

export class DraftsStore {
  @observable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _drafts: Entities<any>;

  constructor() {
    this._drafts = new Entities();
    makeObservable(this);
  }

  public create<T extends Draftable>({
    original,
    id,
  }: {
    original: T;
    id?: EntityId;
  }) {
    const draft = new Draft({ original });
    return this._drafts.add({ entity: draft, id });
  }

  public get<T extends Draftable>({ id }: { id: EntityId }) {
    return this._drafts.get({ id }) as Draft<T>;
  }
}
