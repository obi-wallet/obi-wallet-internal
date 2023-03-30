import {
  createObservableUserInteractions,
  createUserInteractions,
} from "./factories";
import { UserInteractions as UserInteractionsInterface } from "./implementation";

export type UserInteractions = UserInteractionsInterface;

export const UserInteractions = {
  create: createUserInteractions,
};

export const ObservableUserInteractions = {
  create: createObservableUserInteractions,
};
