import { KeyType } from "@obi-wallet/sdk";
import { ztxTheme } from "@obi-wallet/theme";

import { obiModalConfig } from "./obi";
import { Config } from "../config";

export const ztxModalConfig: Config = {
  ...obiModalConfig,
  theme: ztxTheme,
  chains: {
    enabled: ["pulsar-3", "secret-4"],
    default: "secret-4",
  },
  keys: {
    enabled: [KeyType.ZAuth, KeyType.Phone],
    required: [KeyType.ZAuth, KeyType.Phone],
    comingSoon: [],
  },
  ethereumBalances: true,
  headless: true,
};
