import { z } from "zod";

import { CloudKey } from "./cloud";
import { DeviceKey } from "./device";
import { EmailKey } from "./email";
import { NfcKey } from "./nfc";
import { PhoneKey } from "./phone";
import { SocialKey } from "./social";
import { Secp256k1PublicKey } from "../../../keys";
import { migratable } from "../../migratable";

export const UsableKeySchema = migratable(
  z.union([DeviceKey, PhoneKey, SocialKey, NfcKey, CloudKey, EmailKey])
);

export const PendingRecoveryKeySchema = migratable(
  z.object({
    payload: z.object({
      type: z.string(),
      publicKey: Secp256k1PublicKey,
    }),
  })
);

export const KeySchema = migratable(
  z.union([
    UsableKeySchema.migratableSchema,
    PendingRecoveryKeySchema.migratableSchema,
  ])
);
