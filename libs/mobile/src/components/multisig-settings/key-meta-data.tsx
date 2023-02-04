import { KeyType } from "@obi-wallet/common";
import { ComponentType } from "react";
import { useIntl } from "react-intl";
import { SvgProps } from "react-native-svg";

import Cloud from "./assets/cloud.svg";
import DeviceLoop from "./assets/device-loop.svg";
import DeviceObi from "./assets/device-obi.svg";
import Email from "./assets/email.svg";
import Ledger from "./assets/ledger.svg";
import Map from "./assets/map.svg";
import Nfc from "./assets/nfc.svg";
import Phone from "./assets/phone.svg";
import { useStore } from "../../app/stores";
import SocialLoop from "../../assets/social-loop.svg";
import SocialObi from "../../assets/social-obi.svg";
import { SendIcon as Telegram } from "../../components/send-icon";

export enum ComingSoonKeyType {
  Cloud = "cloud",
  Email = "email",
  Nfc = "nfc",
  Telegram = "telegram",
  Map = "map",
  Ledger = "ledger",
}

export function useKeyMetaData() {
  const intl = useIntl();
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();

  const keys = [KeyType.Device, KeyType.Phone, KeyType.Social, KeyType.Email];
  const comingSoonKeys = [
    ComingSoonKeyType.Cloud,
    ComingSoonKeyType.Nfc,
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
      Icon: isLoop ? DeviceLoop : DeviceObi,
    },
    [KeyType.Phone]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.phonekey",
        defaultMessage: "Phone Key",
      }),
      Icon: Phone,
    },
    [KeyType.Social]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.socialkey",
        defaultMessage: "Social Key",
      }),
      Icon: isLoop ? SocialLoop : SocialObi,
    },
    [KeyType.Email]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.emailkey",
        defaultMessage: "Email Recovery Key",
      }),
      Icon: Email,
    },
    [ComingSoonKeyType.Cloud]: {
      label: "Cloud Key",
      Icon: Cloud,
    },
    [ComingSoonKeyType.Nfc]: {
      label: "NFC Tap Key",
      Icon: Nfc,
    },
    [ComingSoonKeyType.Telegram]: {
      label: "Telegram Key",
      Icon: Telegram as ComponentType<SvgProps>,
    },
    [ComingSoonKeyType.Map]: {
      label: "Map Point Key",
      Icon: Map,
    },
    [ComingSoonKeyType.Ledger]: {
      label: "Ledger Key",
      Icon: Ledger,
    },
  };

  return {
    keys,
    comingSoonKeys,
    metaData,
  };
}
