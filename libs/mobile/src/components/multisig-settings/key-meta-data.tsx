import { KeyType } from "@obi-wallet/common";
import { ComponentType } from "react";
import { useIntl } from "react-intl";
import { SvgProps } from "react-native-svg";

import BiometricsObi from "../../app/screens/components/keys-list/assets/biometrics-obi-icon.svg";
import Cloud from "../../app/screens/components/keys-list/assets/cloud-icon.svg";
import Email from "../../app/screens/components/keys-list/assets/email-icon.svg";
import Ledger from "../../app/screens/components/keys-list/assets/ledger-icon.svg";
import MapPoint from "../../app/screens/components/keys-list/assets/map-point-icon.svg";
import Nfc from "../../app/screens/components/keys-list/assets/nfc-icon.svg";
import PhoneNumber from "../../app/screens/components/keys-list/assets/phone-number-icon.svg";
import { SendIcon } from "../../app/screens/home/components/send";
import People from "../../app/screens/onboarding/common/4-social/assets/people-alt-twotone-24px.svg";

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

  const keys = [KeyType.Device, KeyType.Phone, KeyType.Social];
  const comingSoonKeys = [
    ComingSoonKeyType.Email,
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
      Icon: BiometricsObi,
    },
    [KeyType.Phone]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.phonekey",
        defaultMessage: "Phone Key",
      }),
      Icon: PhoneNumber,
    },
    [KeyType.Social]: {
      label: intl.formatMessage({
        id: "settings.multisig.option.socialkey",
        defaultMessage: "Social Key",
      }),
      Icon: People,
    },

    [ComingSoonKeyType.Cloud]: {
      label: "Cloud Key",
      Icon: Cloud,
    },
    [ComingSoonKeyType.Email]: {
      label: "E-mail Key",
      Icon: Email,
    },
    [ComingSoonKeyType.Nfc]: {
      label: "NFC Tap Key",
      Icon: Nfc,
    },
    [ComingSoonKeyType.Telegram]: {
      label: "Telegram Key",
      Icon: SendIcon as ComponentType<SvgProps>,
    },
    [ComingSoonKeyType.Map]: {
      label: "Map Point Key",
      Icon: MapPoint,
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
