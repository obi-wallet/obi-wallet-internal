import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

export type WalletConnectPairingUserInteractionPayload = unknown;

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
