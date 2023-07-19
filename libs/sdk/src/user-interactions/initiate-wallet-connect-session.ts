import { createUserInteractionType, UserInteraction } from "./abstract";
import { WalletMeta } from "../data-structures";

export type InitiateWalletConnectSessionUserInteraction = UserInteraction<
  {
    readonly peerMeta: {
      description: string;
      icons: string[];
      name: string;
      url: string;
    };
    readonly walletMeta: WalletMeta;
  },
  { approved: boolean }
>;

export const InitiateWalletConnectSessionUserInteractionSymbol = Symbol();
export const InitiateWalletConnectSessionUserInteraction =
  createUserInteractionType<InitiateWalletConnectSessionUserInteraction>(
    InitiateWalletConnectSessionUserInteractionSymbol,
  );
