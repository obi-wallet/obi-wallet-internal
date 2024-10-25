import { KeyType, SecretJsHomeChainId } from "@obi-wallet/sdk";

import { Config } from "../config";
import { Feature } from "../feature";
import { ComingSoonKeyType } from "../key";

export const obiModalConfig: Config = {
  chains: {
    enabled: [SecretJsHomeChainId.MAINNET],
    default: SecretJsHomeChainId.MAINNET,
  },
  languages: {
    enabled: ["en"],
    default: "en",
  },
  features: {
    [Feature.AccountsTab]: true,
    [Feature.HealthChecks]: false,
    [Feature.NftTab]: false,
    [Feature.Recovery]: true,
    [Feature.Staking]: true,
    [Feature.BrandToggle]: false,
    [Feature.DemoMode]: true,
  },
  keys: {
    enabled: [KeyType.Passkey, KeyType.Phone],
    required: [KeyType.Passkey, KeyType.Phone],
    comingSoon: [
      ComingSoonKeyType.Telegram,
      ComingSoonKeyType.Map,
      ComingSoonKeyType.Ledger,
    ],
  },
};
