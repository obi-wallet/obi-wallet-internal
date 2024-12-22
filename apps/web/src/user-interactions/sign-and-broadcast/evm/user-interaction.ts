import { SerializedEvmUserOperationCalls } from "@/target-chain/eip-155";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

export interface SignAndBroadcastEvmPayload {
  readonly walletMeta: {
    id: string;
  };
  readonly targetChainId: Eip155ChainId;
  readonly cancelable: boolean;
  readonly calls: SerializedEvmUserOperationCalls;
  readonly mockOnly?: boolean;
}

export type SignAndBroadcastEvm = UserInteraction<
  SignAndBroadcastEvmPayload,
  { approved: true; hash: HexEncodedStringWithPrefix } | { approved: false }
>;

export const SignAndBroadcastEvmSymbol = Symbol();
export const SignAndBroadcastEvm =
  createUserInteractionType<SignAndBroadcastEvm>(SignAndBroadcastEvmSymbol);
