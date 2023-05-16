import { Brand, Config, Feature } from "@obi-wallet/common-deprecated";
import { KeyType } from "@obi-wallet/sdk";

export const obiMobileConfig: Config = {
  brand: Brand.Obi,
  chains: {
    enabled: ["phoenix-1"],
    default: "phoenix-1",
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
