import { KeyItem } from "@/components";

export const MOCK_KEY_LIST: KeyItem[] = [
  {
    type: "passkey",
    label: "Passkey",
    active: true,
    mandatory: true,
    keys: [],
  },
  {
    type: "phone",
    label: "Phone Key",
    active: true,
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
    type: "telegram",
    label: "Telegram Key",
    active: true,
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
  {
    type: "ledger",
    label: "Ledger Key",
    active: true,
    keys: [],
  },
];
