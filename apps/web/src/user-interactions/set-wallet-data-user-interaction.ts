import { KeyMetaData } from "@/stores/key-meta-data";
import { Utf8EncodedString } from "@obi-wallet/encoding";
import { HomeChainId, MultisigKeySchema } from "@obi-wallet/sdk";
import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";
import { z } from "zod";

export interface SetWalletDataUserInteractionPayload {
  readonly homeChainId: HomeChainId;
  readonly owner: z.infer<typeof MultisigKeySchema>;
  readonly keyMetaData: KeyMetaData;
  readonly serializedWalletData: Utf8EncodedString;
}

export type SetWalletDataUserInteraction = UserInteraction<
  SetWalletDataUserInteractionPayload,
  { approved: boolean }
>;

export const SetWalletDataUserInteractionSymbol = Symbol();
export const SetWalletDataUserInteraction =
  createUserInteractionType<SetWalletDataUserInteraction>(
    SetWalletDataUserInteractionSymbol,
  );
