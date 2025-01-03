import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

import { BroadcastTransactionResult } from "../sdk";

export interface SignAndBroadcastTransactionUserInteractionPayload {
  readonly walletMeta: {
    id: string;
  };
  readonly targetChainId: string;
  readonly cancelable: boolean;
  // Contains chain-specific data structures
  readonly messages: unknown[];
  readonly memo: string;
  readonly mockOnly?: boolean;
}

interface UserInteractionResultApproved {
  approved: true;
  payload: BroadcastTransactionResult;
}

interface UserInteractionResultRejected {
  approved: false;
}

type MaybeApproved =
  | UserInteractionResultApproved
  | UserInteractionResultRejected;

export type SignAndBroadcastTransactionUserInteraction = UserInteraction<
  SignAndBroadcastTransactionUserInteractionPayload,
  MaybeApproved
>;

export const SignAndBroadcastTransactionUserInteractionSymbol = Symbol();
export const SignAndBroadcastTransactionUserInteraction =
  createUserInteractionType<SignAndBroadcastTransactionUserInteraction>(
    SignAndBroadcastTransactionUserInteractionSymbol,
  );
