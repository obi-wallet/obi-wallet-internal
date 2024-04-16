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
