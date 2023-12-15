import { z } from "zod";

import { Secp256k1PublicKey } from "../../../../keys";
import { KeyType } from "../../types";

export const TelegramKey = z.object({
  type: z.literal(KeyType.Telegram),
  payload: z.object({
    publicKey: Secp256k1PublicKey,
    // TODO: remove
    privateKey: z.string(),
    chatID: z.string(),
    securityQuestion: z.string(),
  }),
});
