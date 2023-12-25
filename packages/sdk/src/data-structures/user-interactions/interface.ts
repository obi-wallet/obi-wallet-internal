import { UserInteractionWithType } from "@obi-wallet/sdk-abstract-user-interaction";

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
