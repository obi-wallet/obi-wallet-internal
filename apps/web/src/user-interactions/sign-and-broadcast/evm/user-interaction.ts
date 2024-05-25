import { EvmChainId } from "@/target-chain/evm/chains";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

export interface SignAndBroadcastEvmPayload {
  readonly walletMeta: {
    userEntryAddress: string;
  };
  readonly targetChainId: EvmChainId;
  readonly cancelable: boolean;
  readonly callData: HexEncodedStringWithPrefix;
  readonly mockOnly?: boolean;
}

export type SignAndBroadcastEvm = UserInteraction<
  SignAndBroadcastEvmPayload,
  { approved: boolean }
>;

export const SignAndBroadcastEvmSymbol = Symbol();
export const SignAndBroadcastEvm =
  createUserInteractionType<SignAndBroadcastEvm>(SignAndBroadcastEvmSymbol);
