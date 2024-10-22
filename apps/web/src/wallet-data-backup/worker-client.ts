import {
  HomeChainId,
  MultisigKeySchema,
  Secp256k1PublicKey,
  WalletData,
} from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
import { z } from "zod";

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

export async function lookupWallet({
  homeChainId,
  userEntryAddress,
}: {
  homeChainId: HomeChainId;
  userEntryAddress: string;
}) {
  return await fetch(
    `https://wallets.obiwallet.workers.dev/${encodeURIComponent(homeChainId)}/wallet/${encodeURIComponent(userEntryAddress)}`,
    {
      headers: getAnonymousHeaders(),
    },
  );
}

export function getOwnerData(owner: z.infer<typeof MultisigKeySchema>) {
  return {
    threshold: owner.threshold.toString(),
    keys: owner.keys.map((key) => {
      return key;
    }),
  };
}

export async function setWalletData(walletData: WalletData) {
  return await fetch("https://wallets.obiwallet.workers.dev", {
    method: "POST",
    body: serialize({
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
  walletData: WalletData;
  previousOwner: z.infer<typeof MultisigKeySchema>;
}) {
  return await fetch("https://wallets.obiwallet.workers.dev", {
    method: "POST",
    body: serialize({
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
