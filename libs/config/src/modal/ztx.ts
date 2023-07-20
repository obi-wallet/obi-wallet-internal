import { KeyType } from "@obi-wallet/sdk";
import { ztxTheme } from "@obi-wallet/theme";

import { obiModalConfig } from "./obi";
import { Config } from "../config";

export const ztxModalConfig: Config = {
  ...obiModalConfig,
  theme: ztxTheme,
  keys: {
    enabled: [KeyType.ZAuth],
    required: [KeyType.ZAuth],
    comingSoon: [],
  },
};
