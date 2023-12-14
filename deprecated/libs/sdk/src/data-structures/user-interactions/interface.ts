import { UserInteractionWithType } from "../../user-interactions/abstract";

export interface UserInteractionsInterface {
  getPendingUserInteractionsOfType<
    T extends UserInteractionWithType,
  >(messageType: {
    is(message: UserInteractionWithType): message is T;
  }): T[];

  hasPendingUserInteractionsOfType<
    T extends UserInteractionWithType,
  >(messageType: {
    is(message: UserInteractionWithType): message is T;
  }): boolean;
}
