import { action, observable } from "mobx";

import { Draft, Draftable } from "./draft";
import { Entities, EntityId } from "../entities";

export { Draft };

export class DraftsStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @observable protected accessor _drafts: Entities<any>;

  constructor() {
    this._drafts = new Entities();
  }

  @action
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

  public get<T extends Draftable>({
    id,
  }: {
    id: EntityId;
  }): Draft<T> | undefined {
    return this._drafts.get({ id });
  }
}
