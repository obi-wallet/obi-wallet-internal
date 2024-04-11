import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { MpcWallet, MultisigKey, Serialized } from "../data-structures";
import { HomeChainId } from "../home-chains";

export const WalletData = z.object({
  proxyAddress: z.object({
    address: z.string(),
  }),
  owner: z.object({
    threshold: z.string(),
    keys: z.array(
      z.object({
        type: z.string(),
        publicKey: Secp256k1PublicKey,
      }),
    ),
  }),
  userData: z.object({
    name: z.string(),
    avatar: z.string(),
  }),
  encryptedBackupShare: z.string(),
  encryptedEasyShare: z.string().optional(),
});

export type WalletData = z.infer<typeof WalletData>;

export interface RecoverWalletUserInteractionPayload {
  readonly homeChainId: HomeChainId;
  readonly owner: Serialized<MultisigKey>;
  readonly walletData: WalletData;
}

interface UserInteractionResultApproved {
  approved: true;
  payload: {
    wallet: Serialized<MpcWallet> | null;
  };
}

interface UserInteractionResultRejected {
  approved: false;
}

type MaybeApproved =
  | UserInteractionResultApproved
  | UserInteractionResultRejected;

export type RecoverWalletUserInteraction = UserInteraction<
  RecoverWalletUserInteractionPayload,
  MaybeApproved
>;

export const RecoverWalletUserInteractionSymbol = Symbol();
export const RecoverWalletUserInteraction =
  createUserInteractionType<RecoverWalletUserInteraction>(
    RecoverWalletUserInteractionSymbol,
  );
