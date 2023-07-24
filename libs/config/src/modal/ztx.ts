import { KeyType } from "@obi-wallet/sdk";
import { ztxTheme } from "@obi-wallet/theme";

import { obiModalConfig } from "./obi";
import { Config } from "../config";

export const ztxModalConfig: Config = {
  ...obiModalConfig,
  theme: ztxTheme,
  chains: {
    enabled: ["pulsar-2"],
    default: "pulsar-2",
  },
  keys: {
    enabled: [KeyType.ZAuth],
    required: [KeyType.ZAuth],
    comingSoon: [],
  },
};
