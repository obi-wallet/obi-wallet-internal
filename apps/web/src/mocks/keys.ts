import { KeyItem } from "@/components";
import { KeyType } from "@obi-wallet/sdk";

export const MOCK_KEY_LIST: KeyItem[] = [
  {
    type: KeyType.Passkey,
    label: "Passkey",
    mandatory: true,
    keys: [],
  },
  {
    type: KeyType.Phone,
    label: "Phone Key",
    keys: [
      {
        id: "id1",
        label: "Phone Key Name1",
      },
      {
        id: "id2",
        label: "Phone Key Name2",
      },
    ],
  },
  {
    type: KeyType.Telegram,
    label: "Telegram Key",
    keys: [
      {
        id: "id1",
        label: "Telegram Key Name1",
      },
      {
        id: "id2",
        label: "Telegram Key Name2",
      },
      {
        id: "id3",
        label: "Telegram Key Name3",
      },
    ],
  },
];
