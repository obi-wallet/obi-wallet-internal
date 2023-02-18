import * as t from "io-ts";

import { Duration, Percentage } from "../../helpers";

export const Beneficiary = t.type({
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
