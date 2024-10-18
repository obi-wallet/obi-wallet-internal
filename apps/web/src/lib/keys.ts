import { KeyItems } from "@/components";
import { KeyMetaData } from "@/stores/key-meta-data";
import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { DateTime } from "luxon";
import { prop, sortBy } from "ramda";

export interface KeyTypeMeta {
  type: KeyType;
  label: string;
  possiblePrimaryKey: boolean;
}

export const keyTypeMeta: Record<KeyType, KeyTypeMeta> = {
  [KeyType.Passkey]: {
    type: KeyType.Passkey,
    label: "Passkey",
    possiblePrimaryKey: true,
  },
  [KeyType.Phone]: {
    type: KeyType.Phone,
    label: "Phone Key",
    possiblePrimaryKey: false,
  },
  [KeyType.Telegram]: {
    type: KeyType.Telegram,
    label: "Telegram Key",
    possiblePrimaryKey: false,
  },
  [KeyType.Cloud]: {
    type: KeyType.Cloud,
    label: "Cloud Key",
    possiblePrimaryKey: true,
  },
};

export function useKeyListForMultisigKey({
  multisigKey,
  keyMetaData,
}: {
  multisigKey?: MultisigKey;
  keyMetaData: KeyMetaData;
}): KeyItems[] {
  function getKeysOfType(type: KeyType) {
    if (!multisigKey) return [];
    const keys = multisigKey.getKeysOfType(type).map((key) => {
      const id = key.publicKey.value;
      const { name, timestamp } = keyMetaData[id] ?? {};
      return {
        id: key.publicKey.value,
        label: name || keyTypeMeta[type].label,
        timestamp: timestamp ? DateTime.fromISO(timestamp).toSeconds() : 0,
        key,
        keyMetaData: keyMetaData[id] ?? {},
      };
    });
    return sortBy(prop("timestamp"), keys);
  }

  return [
    {
      ...keyTypeMeta[KeyType.Passkey],
      keys: getKeysOfType(KeyType.Passkey),
    },
    {
      ...keyTypeMeta[KeyType.Phone],
      keys: getKeysOfType(KeyType.Phone),
    },
    {
      ...keyTypeMeta[KeyType.Telegram],
      keys: getKeysOfType(KeyType.Telegram),
    },
    {
      ...keyTypeMeta[KeyType.Cloud],
      keys: getKeysOfType(KeyType.Cloud),
    },
  ];
}
