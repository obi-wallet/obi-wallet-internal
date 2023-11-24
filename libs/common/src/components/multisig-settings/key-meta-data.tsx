import { ComingSoonKeyType } from "@obi-wallet/config";
import { KeyType } from "@obi-wallet/sdk";
import { ComponentType } from "react";
import { useIntl } from "react-intl";
import { SvgProps } from "react-native-svg";

import { useStore } from "../../contexts";
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

export { ComingSoonKeyType };

export function useKeyMetaData() {
  const { configStore } = useStore();

  const intl = useIntl();

  const keys = configStore.config.keys.enabled;
  const comingSoonKeys = configStore.config.keys.comingSoon;

  const metaData: Record<
    KeyType | ComingSoonKeyType,
    {
      label: string;
      Icon: ComponentType<SvgProps>;
    }
  > = {
    [KeyType.Unity]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.unitykey",
        defaultMessage: "Gaming Device Key",
      }),
      Icon: ZtxPlatformRecoveryIcon,
    },
    [KeyType.Device]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.biometricskey",
        defaultMessage: "Biometrics Key",
      }),
      Icon: DeviceKeyIcon,
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
    [KeyType.Nfc]: {
      label: "NFC Tap Key",
      Icon: NfcKeyIcon,
    },
    [KeyType.Phone]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.phonekey",
        defaultMessage: "Phone Key",
      }),
      Icon: isWeb() ? PhoneKeyOutlineIcon : PhoneKeyIcon,
    },
    [KeyType.Social]: {
      label: configStore.config.ethereumBalances
        ? "Platform Recovery"
        : intl.formatMessage({
            id: "settings.multisig.option.socialkey",
            defaultMessage: "Social Recovery Key",
          }),
      Icon: configStore.config.ethereumBalances
        ? ZtxPlatformRecoveryIcon
        : SocialKeyIcon,
    },
    [KeyType.ZAuth]: {
      // TODO:
      label: "ZAuth Key",
      // TODO:
      Icon: ZtxPlatformRecoveryIcon,
    },
    [KeyType.Telegram]: {
      label: "Telegram Key",
      Icon: TelegramKeyIcon as ComponentType<SvgProps>,
    },
    [KeyType.Ledger]: {
      label: "Ledger Key",
      Icon: LedgerKeyIcon,
    },
    [ComingSoonKeyType.Map]: {
      label: "Map Point Key",
      Icon: MapKeyIcon,
    },
  };

  return {
    keys,
    comingSoonKeys,
    metaData,
  };
}
