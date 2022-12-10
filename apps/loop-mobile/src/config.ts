import { Config } from "@obi-wallet/common";

export const config: Config = {
  chains: {
    enabled: ["juno-1"],
    default: "juno-1",
  },
  languages: {
    enabled: ["en", "es"],
    default: "en",
  },
  features: {
    healthChecks: false,
    nftTab: true,
  },
};
