import { Brand, Config, Feature, MultisigWalletType } from "@obi-wallet/common";

export const config: Config = {
  brand: Brand.Loop,
  defaultMultisigWalletType: MultisigWalletType.Cosmos,
  chains: {
    enabled: ["juno-1", "uni-3"],
    default: "juno-1",
  },
  terraChains: {
    enabled: [],
    default: "phoenix-1",
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
