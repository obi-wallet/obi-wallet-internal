import { KeyMetaData } from "@/stores/key-meta-data";
import { Utf8EncodedString } from "@obi-wallet/encoding";
import { HomeChainId, MultisigKey, Serialized } from "@obi-wallet/sdk";
import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

export interface SetWalletDataUserInteractionPayload {
  readonly homeChainId: HomeChainId;
  readonly owner: Serialized<MultisigKey>;
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
