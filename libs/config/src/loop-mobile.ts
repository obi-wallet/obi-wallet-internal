import { Brand, Config, Feature } from "@obi-wallet/common";

export const loopMobileConfig: Config = {
  brand: Brand.Loop,
  chains: {
    enabled: ["juno-1"],
    default: "juno-1",
  },
  languages: {
    enabled: ["en", "es"],
    default: "en",
  },
  features: {
    [Feature.AccountsTab]: false,
    [Feature.HealthChecks]: false,
    [Feature.NftTab]: true,
    [Feature.Recovery]: true,
    [Feature.Staking]: false,
    [Feature.InAppPurchases]: true,
    [Feature.BrandToggle]: true,
    [Feature.DemoMode]: false,
  },
};
