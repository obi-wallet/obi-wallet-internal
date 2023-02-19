import * as t from "io-ts";

import {
  DateFromISOString,
  Duration,
  nullable,
  Percentage,
} from "../../helpers";
import { Secp256k1PublicKey } from "../multisig-key/keys/public-key";

export const AccountMetaData = t.type({
  name: t.string,
  icon: t.string,
});

export const Beneficiary = t.type({
  meta: AccountMetaData,
  address: t.string,
  dormancyThreshold: Duration,
  dripSchedule: t.type({
    rate: Percentage,
    period: Duration,
  }),
});

export type Beneficiary = t.TypeOf<typeof Beneficiary>;

export const SpendLimit = t.type({
  amount: t.number,
  period: Duration,
});

export const AutoSign = t.type({
  endTime: DateFromISOString,
  // TODO: serialized revoke tx ready to broadcast. Although that might not need to be persisted actually.
});

export const FlexAccount = t.type({
  meta: AccountMetaData,
  address: t.string,
  publicKey: Secp256k1PublicKey,
  privateKey: t.string,
  spendLimit: nullable(SpendLimit),
  autoSign: nullable(AutoSign),
});

export type FlexAccount = t.TypeOf<typeof FlexAccount>;

export const SerializedGatekeeperConfig = t.type({
  beneficiaries: t.readonlyArray(Beneficiary),
  flexAccounts: t.readonlyArray(FlexAccount),
});

export type SerializedGatekeeperConfig = t.TypeOf<
  typeof SerializedGatekeeperConfig
>;
