import { Brand, Config, Feature, WalletType } from "@obi-wallet/common";

export const config: Config = {
  brand: Brand.Loop,
  defaultMultisigWalletType: WalletType.CosmosMultisig,
  cosmosChains: {
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
    [Feature.RecoveryWorkflow]: true,
    [Feature.SinglesigWallets]: true,
    [Feature.Staking]: true,
  },
};
