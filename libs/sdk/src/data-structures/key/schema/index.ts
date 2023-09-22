import { z } from "zod";

import { CloudKey } from "./cloud";
import { DeviceKey } from "./device";
import { EmailKey } from "./email";
import { EmailRecoveryKey } from "./email-recovery";
import { NfcKey } from "./nfc";
import { PhoneKey } from "./phone";
import { SocialKey } from "./social";
import { UnityKey } from "./unity";
import { ZAuthKey } from "./z-auth";
import { Secp256k1PublicKey } from "../../../keys";
import { migratable } from "../../migratable";

export const UsableKeySchema = migratable(
  z.union([
    CloudKey,
    DeviceKey,
    EmailKey,
    EmailRecoveryKey,
    NfcKey,
    PhoneKey,
    SocialKey,
    UnityKey,
    ZAuthKey,
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
