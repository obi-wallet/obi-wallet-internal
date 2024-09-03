import { KeyItems } from "@/components";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { KeyMetaData } from "@/stores/key-meta-data";
import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { DateTime } from "luxon";
import { prop, sortBy } from "ramda";

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
  [KeyType.Cloudkey]: {
    type: KeyType.Cloudkey,
    label: "Cloud key",
    mandatory: false,
  },
};

export function useKeyList() {
  const currentWallet = useCurrentWallet({});
  const { keyMetaDataStore } = useStore();

  const keyMetaData = currentWallet
    ? keyMetaDataStore.getKeyMetaData(currentWallet.userEntryAddress)
    : {};

  return useKeyListForMultisigKey({
    multisigKey: currentWallet?.owner,
    keyMetaData,
  });
}

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
      ...keyTypeMeta[KeyType.Cloudkey],
      keys: getKeysOfType(KeyType.Cloudkey),
    },
  ];
}
