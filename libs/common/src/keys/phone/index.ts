import { DemoModeTwilioClient, TwilioClient } from "@obi-wallet/sdk";

import { Env } from "../../contexts";

const DEMO_PUBLIC_KEY = "A6J4MMAkdwzopAESgMqCAqy33l873BIbWy/nzdyoXkoe";
const DEMO_PRIVATE_KEY = "eZWdYnw59qFVTHLPIVyUN1xgNXKMuURUCp2wsWF29Aw=";

const demoModeTwilioClient = new DemoModeTwilioClient({
  publicKey: {
    type: "tendermint/PubKeySecp256k1",
    value: DEMO_PUBLIC_KEY,
  },
  privateKey: DEMO_PRIVATE_KEY,
});

export function getTwilioClient({
  demoMode,
  env,
}: {
  demoMode: boolean;
  env: Env;
}) {
  if (demoMode) return demoModeTwilioClient;

  const TWILIO_BASIC_AUTH = `Basic ${Buffer.from(
    `${env.PHONE_NUMBER_TWILIO_BASIC_AUTH_USER}:${env.PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD}`
  ).toString("base64")}`;

  return new TwilioClient({
    authorization: TWILIO_BASIC_AUTH,
    secret: env.PHONE_NUMBER_KEY_SECRET,
  });
}
