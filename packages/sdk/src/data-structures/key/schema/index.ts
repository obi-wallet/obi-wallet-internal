import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { z } from "zod";

import { CloudKey } from "./cloud";
import { PasskeyKey } from "./passkey";
import { PhoneKey } from "./phone";
import { TelegramKey } from "./telegram";
import { migratable } from "../../migratable";

export const UsableKeySchema = migratable(
  z.union([PasskeyKey, PhoneKey, TelegramKey, CloudKey]),
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
