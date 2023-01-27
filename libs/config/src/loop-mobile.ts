import { Brand, Config, Feature, WalletType } from "@obi-wallet/common";

export const loopMobileConfig: Config = {
  brand: Brand.Loop,
  defaultMultisigWalletType: WalletType.CosmosMultisig,
  cosmosChains: {
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
    [Feature.Recovery]: true,
    [Feature.SinglesigWallets]: true,
    [Feature.Staking]: false,
    [Feature.InAppPurchases]: true,
    [Feature.BrandToggle]: true,
    [Feature.DemoMode]: true,
  },
};
