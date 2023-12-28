import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

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
