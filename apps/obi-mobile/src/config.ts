import { Brand, Config, Feature } from "@obi-wallet/common";

export const config: Config = {
  brand: Brand.Obi,
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
  },
};
