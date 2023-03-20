import { DateTime, Duration } from "luxon";
import { z } from "zod";

import { AutoSign, FlexAccountSchema, SpendLimit } from "./schema";
import { Secp256k1PublicKey } from "../../keys";
import { AccountMetaData } from "../gatekeeper-config/account-meta-data";
import { AbstractSerialized } from "../migratable";

export interface FlexAccountInterface {
  readonly schema: typeof FlexAccountSchema;
  readonly type: "flex-account";
  readonly meta: AbstractSerialized<typeof AccountMetaData>;
  readonly address: string;
  readonly publicKey: Secp256k1PublicKey;
  readonly privateKey: string;
  readonly spendLimit: z.infer<typeof SpendLimit> | null;
  readonly hasActiveAutoSign: boolean;
  readonly remainingAutoSignDuration: Duration | null;
  readonly autoSignEndTime: DateTime | null;

  toJSON(): AbstractSerialized<typeof FlexAccountSchema>;
  equals(other: FlexAccountInterface): boolean;
}
