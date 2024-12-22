import { SolanaChainId } from "@/target-chain/solana/chains";
import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";

export interface SvmSendMessage {
  fromAddress: string;
  toAddress: string;
  id: Caip19AssetId;
  rawAmount: string;
}

export interface SignAndBroadcastSvmPayload {
  readonly walletMeta: {
    id: string;
  };
  readonly targetChainId: SolanaChainId;
  readonly cancelable: boolean;
  readonly message: SvmSendMessage;
  readonly mockOnly?: boolean;
}

export type SignAndBroadcastSvm = UserInteraction<
  SignAndBroadcastSvmPayload,
  { approved: true } | { approved: false }
>;

export const SignAndBroadcastSvmSymbol = Symbol();
export const SignAndBroadcastSvm =
  createUserInteractionType<SignAndBroadcastSvm>(SignAndBroadcastSvmSymbol);
