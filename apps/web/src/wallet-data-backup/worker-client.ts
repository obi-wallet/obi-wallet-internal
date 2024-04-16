import { HomeChain } from "@/home-chain";
import { Migratable, MultisigKey } from "@obi-wallet/sdk";

import { NewWalletData } from ".";

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
        previousOwner: HomeChain.chainId(walletData.homeChainId).getOwnerData(
          previousOwner,
        ),
      },
    }),
    headers: {
      Env:
        process.env.NEXT_PUBLIC_ENV === "production" ? "production" : "staging",
      Authorization: `Bearer ${token}`,
    },
  });
}
