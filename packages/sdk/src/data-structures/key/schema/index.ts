import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { CloudKey } from "./cloud";
import { DeviceKey } from "./device";
import { EmailKey } from "./email";
import { EmailRecoveryKey } from "./email-recovery";
import { NfcKey } from "./nfc";
import { PasskeyKey } from "./passkey";
import { PhoneKey } from "./phone";
import { SocialKey } from "./social";
import { TelegramKey } from "./telegram";
import { UnityKey } from "./unity";
import { ZAuthKey } from "./z-auth";
import { migratable } from "../../migratable";

export const UsableKeySchema = migratable(
  z.union([
    CloudKey,
    DeviceKey,
    PasskeyKey,
    EmailKey,
    EmailRecoveryKey,
    NfcKey,
    PhoneKey,
    SocialKey,
    UnityKey,
    ZAuthKey,
    TelegramKey,
  ]),
);

export const PendingRecoveryKeySchema = migratable(
  z.object({
    payload: z.object({
      type: z.string(),
      publicKey: Secp256k1PublicKey,
    }),
  }),
);

export const KeySchema = migratable(
  z.union([
    UsableKeySchema.migratableSchema,
    PendingRecoveryKeySchema.migratableSchema,
  ]),
);
