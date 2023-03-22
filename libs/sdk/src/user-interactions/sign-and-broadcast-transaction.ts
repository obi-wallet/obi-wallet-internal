import { createUserInteractionType, UserInteraction } from "./abstract";
import { Chain } from "../chains";
import { MultisigKey, Serialized, WalletMeta } from "../data-structures";
import { BroadcastTransactionResult } from "../sdk";
import { Message } from "../transactions";

interface CommonPayloadWalletMeta {
  readonly walletMeta: WalletMeta;
}

interface CommonPayloadMultisigKey {
  readonly multisigKey: Serialized<typeof MultisigKey>;
}

export type SignAndBroadcastTransactionMessage = UserInteraction<
  {
    readonly chain: Chain;
    readonly messages: Message[];
    readonly demoMode: boolean;
    readonly cancelable: boolean;
  } & (CommonPayloadMultisigKey | CommonPayloadWalletMeta),
  { approved: true; payload: BroadcastTransactionResult } | { approved: false }
>;
export const SignAndBroadcastTransactionMessage =
  createUserInteractionType<SignAndBroadcastTransactionMessage>();
