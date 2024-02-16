import { DirectSignResponse } from "@cosmjs/proto-signing";
import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";

export interface CosmosSignDirectUserInteractionPayload {
  readonly walletMeta: {
    userEntryAddress: string;
  };
  readonly cancelable: boolean;
  readonly signerAddress: string;
  readonly signDoc: SignDoc;
}

export type CosmosSignDirectUserInteraction = UserInteraction<
  CosmosSignDirectUserInteractionPayload,
  | {
      approved: true;
      payload: DirectSignResponse;
    }
  | {
      approved: false;
    }
>;

export const CosmosSignDirectUserInteractionSymbol = Symbol();
export const CosmosSignDirectUserInteraction =
  createUserInteractionType<CosmosSignDirectUserInteraction>(
    CosmosSignDirectUserInteractionSymbol,
  );
