import { KeyType } from "@obi-wallet/sdk";
import { ztxTheme } from "@obi-wallet/theme";

import { obiModalConfig } from "./obi";
import { Config } from "../config";

export const ztxModalConfig: Config = {
  ...obiModalConfig,
  theme: ztxTheme,
  chains: {
    enabled: ["pulsar-3", "secret-4"],
    default: "pulsar-3",
  },
  keys: {
    enabled: [KeyType.ZAuth],
    required: [KeyType.ZAuth],
    comingSoon: [],
  },
  ethereumBalances: true,
  headless: true,
};
