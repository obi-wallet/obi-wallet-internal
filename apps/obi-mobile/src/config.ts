import { Brand, Config, Feature, MultisigWalletType } from "@obi-wallet/common";

export const config: Config = {
  brand: Brand.Obi,
  defaultMultisigWalletType: MultisigWalletType.Terra,
  chains: {
    enabled: ["juno-1", "uni-3"],
    default: "juno-1",
  },
  terraChains: {
    enabled: ["phoenix-1", "pisco-1"],
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
