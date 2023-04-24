import * as Sentry from "@sentry/react-native";
import { APP_ENV, SENTRY_DSN } from "react-native-dotenv";

import { envInvariant } from "../helpers/invariant";

envInvariant("APP_ENV", APP_ENV);

export function initSentry({
  release,
  dist,
}: {
  release: string;
  dist: string;
}) {
  Sentry.init({
    dsn: __DEV__ ? undefined : SENTRY_DSN,
    tracesSampleRate: __DEV__ ? 1.0 : 0.5,
    environment: __DEV__ ? "development" : APP_ENV,
    release: "money.obi.wallet@0.14.0+codepush:v65",
    dist: "65",
  });
}
