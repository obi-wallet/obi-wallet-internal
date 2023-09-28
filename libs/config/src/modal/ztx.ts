import { KeyType } from "@obi-wallet/sdk";
import { ztxTheme } from "@obi-wallet/theme";

import { obiModalConfig } from "./obi";
import { Config } from "../config";

/// `enabled` determines which keys show in key settings;
/// `required` is which keys are shown by default during onboarding steps
/// TODO: add a `minimumKeys` here which ZAuth can ignore
export const ztxModalConfig: Config = {
  ...obiModalConfig,
  theme: ztxTheme,
  chains: {
    enabled: ["secret-4"],
    default: "secret-4",
  },
  keys: {
    enabled: [
      KeyType.Unity,
      KeyType.Device,
      KeyType.Email,
      KeyType.Phone,
      KeyType.Telegram,
      // KeyType.Nfc,
      // KeyType.ZAuth,
      // KeyType.Cloud,
    ],
    required: [KeyType.Device],
    comingSoon: [],
  },
  ethereumBalances: true,
  headless: false,
};
