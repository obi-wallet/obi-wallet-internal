import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

import { BroadcastTransactionResult } from "../sdk";

export interface SignAndBroadcastTransactionUserInteractionPayload {
  readonly walletMeta: {
    userEntryAddress: string;
  };
  readonly targetChainId: string;
  readonly cancelable: boolean;
  // Contains chain-specific data structures
  readonly messages: unknown[];
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

export type NewSignAndBroadcastTransactionUserInteraction = UserInteraction<
  SignAndBroadcastTransactionUserInteractionPayload,
  MaybeApproved
>;

export const NewSignAndBroadcastTransactionUserInteractionSymbol = Symbol();
export const NewSignAndBroadcastTransactionUserInteraction =
  createUserInteractionType<NewSignAndBroadcastTransactionUserInteraction>(
    NewSignAndBroadcastTransactionUserInteractionSymbol,
  );
