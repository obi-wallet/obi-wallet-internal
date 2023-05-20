import { KeyType } from "@obi-wallet/sdk";
import { ComponentType } from "react";
import { useIntl } from "react-intl";
import { SvgProps } from "react-native-svg";

import { useStore } from "../../contexts";
import { SendIcon as Telegram } from "../send-icon";

// TODO:
// import Cloud from "./assets/cloud.svg";
const Cloud = Telegram as ComponentType<SvgProps>;

// TODO:
// import DeviceLoop from "./assets/device-loop.svg";
const DeviceLoop = Telegram as ComponentType<SvgProps>;

// TODO:
// import DeviceObi from "./assets/device-obi.svg";
const DeviceObi = Telegram as ComponentType<SvgProps>;

// TODO:
// import Email from "./assets/email.svg";
const Email = Telegram as ComponentType<SvgProps>;

// TODO:
// import Ledger from "./assets/ledger.svg";
const Ledger = Telegram as ComponentType<SvgProps>;

// TODO:
// import Map from "./assets/map.svg";
const Map = Telegram as ComponentType<SvgProps>;

// TODO:
// import Nfc from "./assets/nfc.svg";
const Nfc = Telegram as ComponentType<SvgProps>;

// TODO:
// import Phone from "./assets/phone.svg";
const Phone = Telegram as ComponentType<SvgProps>;

// TODO:
// import SocialLoop from "../../assets/social-loop.svg";
const SocialLoop = Telegram as ComponentType<SvgProps>;

// TODO:
// import SocialObi from "../../assets/social-obi.svg";
const SocialObi = Telegram as ComponentType<SvgProps>;

export enum ComingSoonKeyType {
  Telegram = "telegram",
  Map = "map",
  Ledger = "ledger",
}

export function useKeyMetaData() {
  const intl = useIntl();
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();

  const keys = [
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
        defaultMessage: "Social Recovery Key",
      }),
      Icon: isLoop ? SocialLoop : SocialObi,
    },
    [KeyType.Nfc]: {
      label: "NFC Tap Key",
      Icon: Nfc,
    },
    [KeyType.Cloud]: {
      label: "Cloud Key",
      Icon: Cloud,
    },
    [KeyType.Email]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.emailkey",
        defaultMessage: "Email Recovery Key",
      }),
      Icon: Email,
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
