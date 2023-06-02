import { KeyType } from "@obi-wallet/sdk";
import { osmosisTheme } from "@obi-wallet/theme";

import { Config } from "./config";
import { Feature } from "./feature";

export const obiModalConfig: Config = {
  chains: {
    enabled: ["osmo-test-5"],
    default: "osmo-test-5",
  },
  languages: {
    enabled: ["en"],
    default: "en",
  },
  features: {
    [Feature.AccountsTab]: true,
    [Feature.HealthChecks]: false,
    [Feature.NftTab]: false,
    [Feature.Recovery]: true,
    [Feature.Staking]: true,
    [Feature.BrandToggle]: false,
    [Feature.DemoMode]: true,
  },
  requiredKeys: [KeyType.Device, KeyType.Phone],
  theme: osmosisTheme,
};
