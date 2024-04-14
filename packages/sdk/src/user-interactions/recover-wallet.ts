import {
  createUserInteractionType,
  UserInteraction,
} from "@obi-wallet/sdk-abstract-user-interaction";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { MultisigKey, Serialized } from "../data-structures";
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
  encryptedKeyMetaData: z.string().optional(),
});

export type WalletData = z.infer<typeof WalletData>;

export const SingleKeyMetaData = z.object({
  name: z.string().optional(),
  timestamp: z.string().datetime({ offset: true }).optional(),
  payload: z.unknown().optional(),
});

export type SingleKeyMetaData = z.TypeOf<typeof SingleKeyMetaData>;

export const KeyMetaData = z.record(SingleKeyMetaData);

export type KeyMetaData = z.TypeOf<typeof KeyMetaData>;

export interface RecoverWalletUserInteractionPayload {
  readonly homeChainId: HomeChainId;
  readonly owner: Serialized<MultisigKey>;
  readonly walletData: WalletData;
  readonly keyMetaData: KeyMetaData;
}

interface UserInteractionResultApproved {
  approved: true;
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
