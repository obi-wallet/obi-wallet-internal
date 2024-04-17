import {
  Migratable,
  MultisigKey,
  PendingRecoveryKeySchema,
  UsableKeySchema,
} from "@obi-wallet/sdk";

import { NewWalletData } from ".";

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
  const env =
    process.env.NEXT_PUBLIC_ENV === "production" ? "production" : "staging";
  const token =
    env === "production"
      ? process.env.WALLETS_WORKER_SECRET_PRODUCTION
      : process.env.WALLETS_WORKER_SECRET_STAGING;
  return await fetch("https://wallets.obiwallet.workers.dev", {
    method: "POST",
    body: JSON.stringify({
      type: "set-wallet-data",
      payload: walletData,
    }),
    headers: {
      Env:
        process.env.NEXT_PUBLIC_ENV === "production" ? "production" : "staging",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateOwner({
  walletData,
  previousOwner,
}: {
  walletData: NewWalletData;
  previousOwner: Migratable<MultisigKey>;
}) {
  const env =
    process.env.NEXT_PUBLIC_ENV === "production" ? "production" : "staging";
  const token =
    env === "production"
      ? process.env.WALLETS_WORKER_SECRET_PRODUCTION
      : process.env.WALLETS_WORKER_SECRET_STAGING;
  return await fetch("https://wallets.obiwallet.workers.dev", {
    method: "POST",
    body: JSON.stringify({
      type: "update-owner",
      payload: {
        walletData,
        previousOwner: getOwnerData(previousOwner),
      },
    }),
    headers: {
      Env:
        process.env.NEXT_PUBLIC_ENV === "production" ? "production" : "staging",
      Authorization: `Bearer ${token}`,
    },
  });
}
