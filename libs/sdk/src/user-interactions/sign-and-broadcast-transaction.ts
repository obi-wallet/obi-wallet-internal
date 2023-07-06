import { createUserInteractionType, UserInteraction } from "./abstract";
import { MultisigKey, WalletMeta } from "../data-structures";
import { BroadcastTransactionResult } from "../sdk";
import { Message } from "../transactions";

interface CommonPayloadWalletMeta {
  readonly walletMeta: WalletMeta;
}

interface CommonPayloadMultisigKey {
  readonly multisigKey: MultisigKey;
}

export type SignAndBroadcastTransactionUserInteraction = UserInteraction<
  {
    readonly messages: Message[];
    readonly demoMode: boolean;
    readonly cancelable: boolean;
    readonly autoBroadcast?: boolean;
    readonly isLogin?: boolean;
  } & (CommonPayloadMultisigKey | CommonPayloadWalletMeta),
  { approved: true; payload: BroadcastTransactionResult } | { approved: false }
>;

export const SignAndBroadcastTransactionUserInteractionSymbol = Symbol();
export const SignAndBroadcastTransactionUserInteraction =
  createUserInteractionType<SignAndBroadcastTransactionUserInteraction>(
    SignAndBroadcastTransactionUserInteractionSymbol
  );
