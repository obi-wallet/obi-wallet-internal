import {
  createObservableUserInteractions,
  createUserInteractions,
} from "./factories";
import { UserInteractionsInterface } from "./interface";

export type UserInteractions = UserInteractionsInterface;

export const UserInteractions = {
  create: createUserInteractions,
};

export const ObservableUserInteractions = {
  create: createObservableUserInteractions,
};
