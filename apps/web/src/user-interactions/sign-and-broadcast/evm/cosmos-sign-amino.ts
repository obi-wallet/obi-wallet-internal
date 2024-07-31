import { AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

export interface CosmosSignAminoUserInteractionPayload {
  readonly walletMeta: {
    userEntryAddress: string;
  };
  readonly cancelable: boolean;
  readonly signerAddress: string;
  readonly signDoc: StdSignDoc;
}

export type CosmosSignAminoUserInteraction = UserInteraction<
  CosmosSignAminoUserInteractionPayload,
  | {
      approved: true;
      payload: AminoSignResponse;
      txHash: string;
    }
  | {
      approved: false;
    }
>;

export const CosmosSignAminoUserInteractionSymbol = Symbol();
export const CosmosSignAminoUserInteraction =
  createUserInteractionType<CosmosSignAminoUserInteraction>(
    CosmosSignAminoUserInteractionSymbol,
  );
