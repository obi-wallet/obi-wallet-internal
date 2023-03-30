import { action, makeObservable, observable } from "mobx";

import { UserInteractions } from "./implementation";

export function createUserInteractions() {
  return new UserInteractions();
}

export function createObservableUserInteractions() {
  const userInteractions = createUserInteractions();
  makeObservable<
    UserInteractions,
    "_userInteractions" | "addUserInteraction" | "removeUserInteractionWithId"
  >(
    userInteractions,
    {
      _userInteractions: observable,
      addUserInteraction: action,
      removeUserInteractionWithId: action,
    },
    { name: "UserInteractions" }
  );
  return userInteractions;
}
