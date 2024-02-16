import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";
import type { Web3WalletTypes } from "@walletconnect/web3wallet";

export type WalletConnectPairingUserInteractionPayload =
  Web3WalletTypes.SessionProposal;

export type WalletConnectPairingUserInteraction = UserInteraction<
  WalletConnectPairingUserInteractionPayload,
  | {
      approved: true;
    }
  | {
      approved: false;
    }
>;

export const WalletConnectPairingUserInteractionSymbol = Symbol();
export const WalletConnectPairingUserInteraction =
  createUserInteractionType<WalletConnectPairingUserInteraction>(
    WalletConnectPairingUserInteractionSymbol,
  );
