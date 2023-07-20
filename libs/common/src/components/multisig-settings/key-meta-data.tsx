import { useTheme } from "@emotion/react";
import { KeyType } from "@obi-wallet/sdk";
import { ComponentType } from "react";
import { useIntl } from "react-intl";
import { SvgProps } from "react-native-svg";

import { isWeb } from "../../helpers";
import {
  CloudKeyIcon,
  DeviceKeyIcon,
  EmailKeyIcon,
  LedgerKeyIcon,
  MapKeyIcon,
  NfcKeyIcon,
  PhoneKeyIcon,
  SendIcon as TelegramKeyIcon,
  SocialKeyIcon,
  PhoneKeyOutlineIcon,
  ZtxPlatformRecoveryIcon,
} from "../icons";

export enum ComingSoonKeyType {
  Telegram = "telegram",
  Map = "map",
  Ledger = "ledger",
}

export function useKeyMetaData() {
  const intl = useIntl();
  const theme = useTheme();

  // TODO: make configurable
  const keys = [
    KeyType.ZAuth,
    KeyType.Device,
    KeyType.Phone,
    KeyType.Social,
    KeyType.Nfc,
    KeyType.Cloud,
    KeyType.Email,
  ];
  const comingSoonKeys = [
    ComingSoonKeyType.Telegram,
    ComingSoonKeyType.Map,
    ComingSoonKeyType.Ledger,
  ];

  const metaData: Record<
    KeyType | ComingSoonKeyType,
    {
      label: string;
      Icon: ComponentType<SvgProps>;
    }
  > = {
    [KeyType.Device]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.biometricskey",
        defaultMessage: "Biometrics Key",
      }),
      Icon: DeviceKeyIcon,
    },
    [KeyType.Phone]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.phonekey",
        defaultMessage: "Phone Key",
      }),
      Icon: isWeb() ? PhoneKeyOutlineIcon : PhoneKeyIcon,
    },
    [KeyType.Social]: {
      label: theme.ethereumBalances
        ? "Platform Recovery"
        : intl.formatMessage({
            id: "settings.multisig.option.socialkey",
            defaultMessage: "Social Recovery Key",
          }),
      Icon: theme.ethereumBalances ? ZtxPlatformRecoveryIcon : SocialKeyIcon,
    },
    [KeyType.Nfc]: {
      label: "NFC Tap Key",
      Icon: NfcKeyIcon,
    },
    [KeyType.Cloud]: {
      label: "Cloud Key",
      Icon: CloudKeyIcon,
    },
    [KeyType.Email]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.emailkey",
        defaultMessage: "Email Recovery Key",
      }),
      Icon: EmailKeyIcon,
    },
    [KeyType.EmailRecovery]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.emailkey",
        defaultMessage: "Email Recovery Key",
      }),
      Icon: EmailKeyIcon,
    },
    [KeyType.ZAuth]: {
      // TODO:
      label: "ZAuth Key",
      // TODO:
      Icon: DeviceKeyIcon,
    },
    [ComingSoonKeyType.Telegram]: {
      label: "Telegram Key",
      Icon: TelegramKeyIcon as ComponentType<SvgProps>,
    },
    [ComingSoonKeyType.Map]: {
      label: "Map Point Key",
      Icon: MapKeyIcon,
    },
    [ComingSoonKeyType.Ledger]: {
      label: "Ledger Key",
      Icon: LedgerKeyIcon,
    },
  };

  return {
    keys,
    comingSoonKeys,
    metaData,
  };
}
