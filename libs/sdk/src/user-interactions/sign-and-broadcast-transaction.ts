import { createUserInteractionType, UserInteraction } from "./abstract";
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

export type SignAndBroadcastTransactionUserInteraction = UserInteraction<
  {
    readonly messages: Message[];
    readonly demoMode: boolean;
    readonly cancelable: boolean;
    readonly autoBroadcast?: boolean;
    readonly isLogin?: boolean;
    readonly targetChainId?: TargetChainId;
  } & (CommonPayloadMultisigKey | CommonPayloadWalletMeta),
  | {
      approved: true;
      payload: BroadcastTransactionResult;
      signature: Uint8Array;
    }
  | { approved: false; signature: undefined }
>;

export const SignAndBroadcastTransactionUserInteractionSymbol = Symbol();
export const SignAndBroadcastTransactionUserInteraction =
  createUserInteractionType<SignAndBroadcastTransactionUserInteraction>(
    SignAndBroadcastTransactionUserInteractionSymbol,
  );
