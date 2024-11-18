import { serialize } from "@obi-wallet/sdk-json";

export async function trackAppConnect({
  userEntryAddress,
  dAppUrl,
}: {
  userEntryAddress: string;
  dAppUrl: string;
}) {
  await fetch("https://analytics.obiwallet.workers.dev/app-connect", {
    method: "POST",
    body: serialize({
      userEntryAddress,
      dAppUrl,
    }),
    headers: getAuthenticatedHeaders(),
  });
}

export async function trackOnboarding({
  userEntryAddress,
  dAppUrl,
}: {
  userEntryAddress: string;
  dAppUrl?: string;
}) {
  await fetch("https://analytics.obiwallet.workers.dev/onboarding", {
    method: "POST",
    body: serialize({
      userEntryAddress,
      dAppUrl,
    }),
    headers: getAuthenticatedHeaders(),
  });
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
