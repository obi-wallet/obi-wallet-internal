import { Brand, Config, Feature } from "@obi-wallet/common";

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
    [Feature.AccountsTab]: false,
    [Feature.HealthChecks]: false,
    [Feature.NftTab]: false,
    [Feature.Recovery]: true,
    [Feature.Staking]: true,
    [Feature.InAppPurchases]: false,
    [Feature.BrandToggle]: false,
    [Feature.DemoMode]: true,
  },
};
