import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

import { MultisigKey, WalletMeta } from "../data-structures";
import { BroadcastTransactionResult } from "../sdk";
import { TargetChainId } from "../target-chains";
import { Message } from "../transactions";

interface CommonPayloadWalletMeta {
  readonly walletMeta: WalletMeta;
}

interface CommonPayloadMultisigKey {
  readonly multisigKey: MultisigKey;
}

interface DefaultInteractionPayload {
  readonly messages: Message[];
  readonly demoMode: boolean;
  readonly cancelable: boolean;
  readonly autoBroadcast?: boolean;
  readonly isLogin?: boolean;
  readonly targetChainId?: TargetChainId;
  readonly hint?: string;
  readonly amount?: string;
}

type WalletMetaOrMultisigKey =
  | CommonPayloadMultisigKey
  | CommonPayloadWalletMeta;

interface BaseUserInteractionResult {
  approved: boolean;
  signature: Uint8Array | undefined;
}

interface UserInteractionResultApproved extends BaseUserInteractionResult {
  approved: true;
  payload: BroadcastTransactionResult;
  signature: Uint8Array | undefined;
}

interface UserInteractionResultRejected extends BaseUserInteractionResult {
  approved: false;
  signature: undefined;
}

type MaybeApproved =
  | UserInteractionResultApproved
  | UserInteractionResultRejected;

export type SignAndBroadcastTransactionUserInteraction = UserInteraction<
  DefaultInteractionPayload & WalletMetaOrMultisigKey,
  MaybeApproved
>;

export const SignAndBroadcastTransactionUserInteractionSymbol = Symbol();
export const SignAndBroadcastTransactionUserInteraction =
  createUserInteractionType<SignAndBroadcastTransactionUserInteraction>(
    SignAndBroadcastTransactionUserInteractionSymbol,
  );
