import { DemoModeTwilioClient, TwilioClient } from "@obi-wallet/sdk";
import {
  PHONE_NUMBER_KEY_SECRET,
  PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD,
  PHONE_NUMBER_TWILIO_BASIC_AUTH_USER,
} from "react-native-dotenv";

import { envInvariant } from "../../helpers/invariant";

envInvariant("PHONE_NUMBER_KEY_SECRET", PHONE_NUMBER_KEY_SECRET);
envInvariant(
  "PHONE_NUMBER_TWILIO_BASIC_AUTH_USER",
  PHONE_NUMBER_TWILIO_BASIC_AUTH_USER
);
envInvariant(
  "PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD",
  PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD
);

const DEV_SHARED_SECRET = PHONE_NUMBER_KEY_SECRET;
const TWILIO_BASIC_AUTH = `Basic ${Buffer.from(
  `${PHONE_NUMBER_TWILIO_BASIC_AUTH_USER}:${PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD}`
).toString("base64")}`;

const DEMO_PUBLIC_KEY = "A6J4MMAkdwzopAESgMqCAqy33l873BIbWy/nzdyoXkoe";
const DEMO_PRIVATE_KEY = "eZWdYnw59qFVTHLPIVyUN1xgNXKMuURUCp2wsWF29Aw=";

const demoModeTwilioClient = new DemoModeTwilioClient({
  publicKey: {
    type: "tendermint/PubKeySecp256k1",
    value: DEMO_PUBLIC_KEY,
  },
  privateKey: DEMO_PRIVATE_KEY,
});
const twilioClient = new TwilioClient({
  authorization: TWILIO_BASIC_AUTH,
  secret: DEV_SHARED_SECRET,
});
export function getTwilioClient(demoMode: boolean) {
  return demoMode ? demoModeTwilioClient : twilioClient;
}
