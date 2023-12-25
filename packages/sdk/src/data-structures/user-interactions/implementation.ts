import {
  eventEmitter,
  userInteractionEvent,
} from "@obi-wallet/sdk-user-interactions";
import { nanoid } from "nanoid/non-secure";

import { UserInteractionWithType } from "../../user-interactions/abstract";

export class UserInteractions {
  protected _userInteractions: (UserInteractionWithType & {
    id: string;
    hint?: string;
    amount?: string;
  })[] = [];

  public constructor() {
    eventEmitter.on(
      userInteractionEvent,
      (emitted: UserInteractionWithType) => {
        this.addUserInteraction(emitted);
      },
    );
  }

  public getPendingUserInteractionsOfType<
    T extends UserInteractionWithType,
  >(messageType: { is(message: UserInteractionWithType): message is T }): T[] {
    return this.userInteractions.filter(messageType.is);
  }

  public hasPendingUserInteractionsOfType<
    T extends UserInteractionWithType,
  >(messageType: {
    is(message: UserInteractionWithType): message is T;
  }): boolean {
    return this.getPendingUserInteractionsOfType(messageType).length > 0;
  }

  protected get userInteractions(): UserInteractionWithType[] {
    return this._userInteractions;
  }

  protected addUserInteraction(message: UserInteractionWithType) {
    const id = nanoid();
    this._userInteractions.push({
      id,
      ...message,
      resolve: (result: unknown) => {
        this.removeUserInteractionWithId(id);
        message.resolve(result);
      },
      reject: (result: Error) => {
        this.removeUserInteractionWithId(id);
        message.reject(result);
      },
    });
  }

  protected removeUserInteractionWithId(id: string) {
    this._userInteractions = this._userInteractions.filter(
      (message) => message.id !== id,
    );
  }
}
