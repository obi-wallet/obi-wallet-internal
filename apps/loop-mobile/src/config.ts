import { Brand, Config, Feature, WalletType } from "@obi-wallet/common";

export const config: Config = {
  brand: Brand.Loop,
  defaultMultisigWalletType: WalletType.Multisig,
  chains: {
    enabled: ["juno-1"],
    default: "juno-1",
  },
  terraChains: {
    enabled: [],
    default: "phoenix-1",
  },
  languages: {
    enabled: ["en", "es"],
    default: "en",
  },
  features: {
    [Feature.AccountsTab]: false,
    [Feature.HealthChecks]: false,
    [Feature.NftTab]: true,
  },
};
