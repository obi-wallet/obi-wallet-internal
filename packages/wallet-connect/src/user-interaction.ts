import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";
import type { Web3WalletTypes } from "@walletconnect/web3wallet";

export type WalletConnectPairingUserInteractionPayload =
  Web3WalletTypes.SessionProposal;

interface UserInteractionResultApproved {
  approved: true;
}

interface UserInteractionResultRejected {
  approved: false;
}

type MaybeApproved =
  | UserInteractionResultApproved
  | UserInteractionResultRejected;

export type WalletConnectPairingUserInteraction = UserInteraction<
  WalletConnectPairingUserInteractionPayload,
  MaybeApproved
>;

export const WalletConnectPairingUserInteractionSymbol = Symbol();
export const WalletConnectPairingUserInteraction =
  createUserInteractionType<WalletConnectPairingUserInteraction>(
    WalletConnectPairingUserInteractionSymbol,
  );
