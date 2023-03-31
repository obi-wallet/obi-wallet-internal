import warning from "tiny-warning";

import { eventEmitter, userInteractionEvent } from "./event-emitter";

export interface CanceledUserInteractionResponse {
  approved: false;
}

export interface SuccessfulUserInteractionResponse<TSuccess> {
  approved: true;
  payload: {
    success: true;
  } & TSuccess;
}

export interface FailedUserInteractionResponse<TFailure> {
  approved: true;
  payload: {
    success: false;
  } & TFailure;
}

export type ApprovedUserInteractionResponse<TSuccess, TFailure> =
  | SuccessfulUserInteractionResponse<TSuccess>
  | FailedUserInteractionResponse<TFailure>;

export type AbstractUserInteractionResponse<TSuccess, TFailure> =
  | CanceledUserInteractionResponse
  | ApprovedUserInteractionResponse<TSuccess, TFailure>;

export interface UserInteraction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TPayload = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResult = any
> {
  payload: TPayload;
  resolve: (result: TResult) => void;
  reject: (error: Error) => void;
}

export type UserInteractionPayload<T> = T extends UserInteraction<
  infer TPayload,
  infer _
>
  ? TPayload
  : never;
export type UserInteractionResult<T> = T extends UserInteraction<
  infer _,
  infer TResult
>
  ? TResult
  : never;

export interface UserInteractionWithType<
  T extends symbol = symbol,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TPayload = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResult = any
> extends UserInteraction<TPayload, TResult> {
  type: T;
}

export function createUserInteractionType<T extends UserInteraction>() {
  type TPayload = UserInteractionPayload<T>;
  type TResult = UserInteractionResult<T>;

  const type = Symbol();
  return {
    start(payload: TPayload) {
      return new Promise<TResult>((resolve, reject) => {
        const message: UserInteractionWithType<typeof type, TPayload, TResult> =
          {
            type,
            payload,
            resolve: resolve,
            reject,
          };
        warning(
          eventEmitter.listenerCount(userInteractionEvent) > 0,
          "No listener registered yet. Did you initialize `UserInteractions`?"
        );
        eventEmitter.emit(userInteractionEvent, message);
      });
    },
    is(
      userInteraction: UserInteractionWithType
    ): userInteraction is UserInteractionWithType<
      typeof type,
      TPayload,
      TResult
    > {
      return userInteraction?.type === type;
    },
  };
}
