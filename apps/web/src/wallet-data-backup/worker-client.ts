import {
  HomeChainId,
  Migratable,
  MultisigKey,
  PendingRecoveryKeySchema,
  Secp256k1PublicKey,
  UsableKeySchema,
} from "@obi-wallet/sdk";

import { NewWalletData } from ".";

export async function isPublicKeyInUse({
  homeChainId,
  publicKey,
}: {
  homeChainId: HomeChainId;
  publicKey: Secp256k1PublicKey;
}) {
  const response = await lookupPublicKey({
    homeChainId,
    publicKey: publicKey,
  });

  switch (response.status) {
    case 200:
      return true;
    case 404:
      return false;
    default:
      throw new Error(`Unexpected status code: ${response.status}`);
  }
}

export async function lookupPublicKey({
  homeChainId,
  publicKey,
}: {
  homeChainId: HomeChainId;
  publicKey: Secp256k1PublicKey;
}) {
  return await fetch(
    `https://wallets.obiwallet.workers.dev/${encodeURIComponent(homeChainId)}/key/${encodeURIComponent(publicKey.value)}`,
    {
      headers: getAnonymousHeaders(),
    },
  );
}

export function getOwnerData(owner: Migratable<MultisigKey>) {
  return {
    threshold: owner.threshold.toString(),
    keys: owner.keys.map((key) => {
      const usableKeyResponse = UsableKeySchema.migratableSchema.safeParse(key);
      if (usableKeyResponse.success) {
        return {
          type: usableKeyResponse.data.type,
          publicKey: usableKeyResponse.data.payload.publicKey,
        };
      }
      const pendingRecoveryKeyResponse =
        PendingRecoveryKeySchema.migratableSchema.safeParse(key);
      if (pendingRecoveryKeyResponse.success) {
        return {
          type: pendingRecoveryKeyResponse.data.payload.type,
          publicKey: pendingRecoveryKeyResponse.data.payload.publicKey,
        };
      }

      throw new Error(`Invalid key: ${JSON.stringify(key)}`);
    }),
  };
}

export async function setWalletData(walletData: NewWalletData) {
  return await fetch("https://wallets.obiwallet.workers.dev", {
    method: "POST",
    body: JSON.stringify({
      type: "set-wallet-data",
      payload: walletData,
    }),
    headers: getAuthenticatedHeaders(),
  });
}

export async function updateOwner({
  walletData,
  previousOwner,
}: {
  walletData: NewWalletData;
  previousOwner: Migratable<MultisigKey>;
}) {
  return await fetch("https://wallets.obiwallet.workers.dev", {
    method: "POST",
    body: JSON.stringify({
      type: "update-owner",
      payload: {
        walletData,
        previousOwner: getOwnerData(previousOwner),
      },
    }),
    headers: getAuthenticatedHeaders(),
  });
}

function getAuthenticatedHeaders() {
  const anonymousHeaders = getAnonymousHeaders();
  const token =
    anonymousHeaders.Env === "production"
      ? process.env.WALLETS_WORKER_SECRET_PRODUCTION
      : process.env.WALLETS_WORKER_SECRET_STAGING;
  return {
    ...anonymousHeaders,
    Authorization: `Bearer ${token}`,
  };
}

function getAnonymousHeaders() {
  const env =
    process.env.NEXT_PUBLIC_ENV === "production" ? "production" : "staging";
  return {
    Env: env,
  };
}
