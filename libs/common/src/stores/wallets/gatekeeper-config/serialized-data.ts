import * as t from "io-ts";

import { Duration, Percentage } from "../../helpers";

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

export const SerializedGatekeeperConfig = t.type({
  beneficiaries: t.readonlyArray(Beneficiary),
});

export type SerializedGatekeeperConfig = t.TypeOf<
  typeof SerializedGatekeeperConfig
>;
