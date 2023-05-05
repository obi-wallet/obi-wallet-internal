import { Config } from "@obi-wallet/common";

import { obiMobileConfig } from "./obi-mobile";

export const obiMobileMultichainConfig: Config = {
  ...obiMobileConfig,
  chains: {
    enabled: ["oasis-3", "phoenix-1"],
    default: "oasis-3",
  },
};
