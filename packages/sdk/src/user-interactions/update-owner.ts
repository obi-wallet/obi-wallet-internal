import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";

import { MultisigKey, Serialized } from "../data-structures";
import { HomeChainId } from "../home-chains";

export interface UpdateOwnerUserInteractionPayload {
  readonly walletMeta: {
    userEntryAddress: string;
  };
  readonly homeChainId: HomeChainId;
  readonly previousOwner: Serialized<MultisigKey>;
  readonly nextOwner: Serialized<MultisigKey>;
}

interface UserInteractionResultApproved {
  approved: true;
  payload: {
    success: boolean;
  };
}

interface UserInteractionResultRejected {
  approved: false;
}

type MaybeApproved =
  | UserInteractionResultApproved
  | UserInteractionResultRejected;

export type UpdateOwnerUserInteraction = UserInteraction<
  UpdateOwnerUserInteractionPayload,
  MaybeApproved
>;

export const UpdateOwnerUserInteractionSymbol = Symbol();
export const UpdateOwnerUserInteraction =
  createUserInteractionType<UpdateOwnerUserInteraction>(
    UpdateOwnerUserInteractionSymbol,
  );
