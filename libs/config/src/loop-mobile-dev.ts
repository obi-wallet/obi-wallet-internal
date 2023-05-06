import { Brand, Config, Feature } from "@obi-wallet/common";
import { KeyType } from "@obi-wallet/sdk";

export const loopMobileDevConfig: Config = {
  brand: Brand.Loop,
  chains: {
    enabled: ["juno-1", "uni-3"],
    default: "juno-1",
  },
  languages: {
    enabled: ["en", "de", "es"],
    default: "en",
  },
  features: {
    [Feature.AccountsTab]: true,
    [Feature.HealthChecks]: true,
    [Feature.NftTab]: true,
    [Feature.Recovery]: true,
    [Feature.Staking]: true,
    [Feature.BrandToggle]: false,
    [Feature.DemoMode]: false,
  },
  requiredKeys: [KeyType.Device, KeyType.Phone],
};
