import { KeyType } from "@obi-wallet/sdk";

import { Brand } from "./brand";
import { Config } from "./config";
import { Feature } from "./feature";

export const obiModalConfig: Config = {
  brand: Brand.Obi,
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
};
