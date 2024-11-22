import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { serialize } from "@obi-wallet/sdk-json";

export async function trackAppConnect({
  userEntryAddress,
  dAppUrl,
}: {
  userEntryAddress: string;
  dAppUrl: string;
}) {
  const response = await fetch(
    "https://analytics.obiwallet.workers.dev/app-connect",
    {
      method: "POST",
      body: serialize({
        userEntryAddress,
        dAppUrl,
      }),
      headers: getAuthenticatedHeaders(),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to track app connect");
  }
}

export async function trackBalances({
  userEntryAddress,
  balances,
}: {
  userEntryAddress: string;
  balances: {
    assetId: Caip19AssetId;
    rawAmount: string;
    usdBalance: string;
  }[];
}) {
  console.log(
    serialize({
      userEntryAddress,
      balances,
    }),
  );
  const response = await fetch(
    "https://analytics.obiwallet.workers.dev/balances",
    {
      method: "POST",
      body: serialize({
        userEntryAddress,
        balances,
      }),
      headers: getAuthenticatedHeaders(),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to track balances");
  }
}

export async function trackOnboarding({
  userEntryAddress,
  dAppUrl,
}: {
  userEntryAddress: string;
  dAppUrl?: string;
}) {
  const response = await fetch(
    "https://analytics.obiwallet.workers.dev/onboarding",
    {
      method: "POST",
      body: serialize({
        userEntryAddress,
        dAppUrl,
      }),
      headers: getAuthenticatedHeaders(),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to track onboarding");
  }
}

function getAuthenticatedHeaders() {
  const anonymousHeaders = getAnonymousHeaders();
  const token =
    anonymousHeaders.Env === "production"
      ? process.env.ANALYTICS_WORKER_SECRET_PRODUCTION
      : process.env.ANALYTICS_WORKER_SECRET_STAGING;
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
