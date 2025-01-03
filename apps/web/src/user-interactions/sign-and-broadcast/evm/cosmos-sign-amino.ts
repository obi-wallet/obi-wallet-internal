import { AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

export interface CosmosSignAminoUserInteractionPayload {
  readonly walletMeta: {
    id: string;
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
