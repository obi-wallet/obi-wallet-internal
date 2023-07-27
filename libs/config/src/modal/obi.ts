import { KeyType } from "@obi-wallet/sdk";
import { obiTheme } from "@obi-wallet/theme";

import { Config } from "../config";
import { Feature } from "../feature";
import { ComingSoonKeyType } from "../key";

export const obiModalConfig: Config = {
  chains: {
    enabled: ["osmo-test-5"],
    default: "osmo-test-5",
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
    enabled: [
      KeyType.Device,
      KeyType.Phone,
      KeyType.Social,
      KeyType.Nfc,
      KeyType.Cloud,
      KeyType.Email,
    ],
    required: [KeyType.Device, KeyType.Phone],
    comingSoon: [
      ComingSoonKeyType.Telegram,
      ComingSoonKeyType.Map,
      ComingSoonKeyType.Ledger,
    ],
  },
  theme: obiTheme,
};
