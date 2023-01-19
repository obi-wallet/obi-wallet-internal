import { Brand, Config, Feature, WalletType } from "@obi-wallet/common";

export const config: Config = {
  brand: Brand.Obi,
  defaultMultisigWalletType: WalletType.TerraMultisig,
  cosmosChains: {
    enabled: ["juno-1", "uni-3"],
    default: "juno-1",
  },
  terraChains: {
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
    [Feature.SinglesigWallets]: false,
    [Feature.Staking]: true,
    [Feature.InAppPurchases]: false,
  },
};
