import { action, makeObservable, observable } from "mobx";

import { UserInteractions } from "./implementation";
import { UserInteractionsInterface } from "./interface";

export function createUserInteractions(): UserInteractionsInterface {
  return new UserInteractions();
}

export function createObservableUserInteractions(): UserInteractionsInterface {
  const userInteractions = createUserInteractions();
  makeObservable<
    UserInteractionsInterface,
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
