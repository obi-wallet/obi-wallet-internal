// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://5184d72cab0f15fa2a006b7cb8ef7eae@o1401288.ingest.us.sentry.io/4507263547604992",
  ...(process.env.NEXT_PUBLIC_ENV
    ? {
        environment: process.env.NEXT_PUBLIC_ENV,
      }
    : {}),
  ...(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    ? { release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA }
    : {}),

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
