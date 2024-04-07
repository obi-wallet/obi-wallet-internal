import { KeyType } from "@obi-wallet/sdk";

export interface KeyTypeMeta {
  type: KeyType;
  label: string;
  mandatory: boolean;
}

export const keyTypeMeta: Record<KeyType, KeyTypeMeta> = {
  [KeyType.Passkey]: {
    type: KeyType.Passkey,
    label: "Passkey",
    mandatory: true,
  },
  [KeyType.Phone]: {
    type: KeyType.Phone,
    label: "Phone Key",
    mandatory: false,
  },
  [KeyType.Telegram]: {
    type: KeyType.Telegram,
    label: "Telegram Key",
    mandatory: false,
  },
};
