"use client";

import { KeyItem } from "@/components";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import {
  Page,
  SecuritySettingsContext,
  useSecuritySettingsContext,
} from "@/security-settings/context";
import { keyTypeMeta } from "@/security-settings/meta";
import { SecuritySettingsIndex } from "@/security-settings/page";
import { SecuritySettingsKeyAddPage } from "@/security-settings/page/key-add";
import { SecuritySettingsKeyItemPage } from "@/security-settings/page/key-item";
import { SecuritySettingsKeyTypePage } from "@/security-settings/page/key-type";
import { SingleKeyMetaData } from "@/stores/key-meta-data";
import { KeyType, MultisigKey, Secp256k1PublicKey } from "@obi-wallet/sdk";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { prop, sortBy } from "ramda";
import { useEffect, useState } from "react";

export const SecuritySettings = observer(function SecuritySettings() {
  const currentWallet = useCurrentWallet({});
  const draftId = `security-${currentWallet?.userEntryAddress}`;
  const { draftsStore, keyMetaDataStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const [navigationStack, setNavigationStack] = useState<Page[]>([]);

  const pushPage = (page: Page) => {
    setNavigationStack((stack) => {
      return [page, ...stack];
    });
  };

  const popPage = () => {
    setNavigationStack((stack) => {
      return stack.slice(1);
    });
  };

  useEffect(() => {
    if (!draft && currentWallet) {
      draftsStore.create({
        id: draftId,
        original: currentWallet.owner,
      });
    }
  }, [currentWallet, draft, draftId, draftsStore]);

  if (!currentWallet || !draft) return null;

  const keyMetaData = keyMetaDataStore.getKeyMetaData(
    currentWallet.userEntryAddress,
  );

  const setKeyMetaData = (
    publicKey: Secp256k1PublicKey,
    singleKeyMetaData: SingleKeyMetaData,
  ) => {
    keyMetaDataStore.setSingleKeyMetaData(
      currentWallet.userEntryAddress,
      publicKey,
      {
        ...keyMetaData[publicKey.value],
        ...singleKeyMetaData,
      },
    );
  };

  function getKeysOfType(type: KeyType) {
    if (!draft) return [];
    const keys = draft.value.getKeysOfType(type).map((key) => {
      const id = key.publicKey.value;
      const { name, timestamp } = keyMetaData[id] ?? {};
      return {
        id: key.publicKey.value,
        label: name ?? keyTypeMeta[type].label,
        timestamp: timestamp ? DateTime.fromISO(timestamp).toSeconds() : 0,
        key,
      };
    });
    return sortBy(prop("timestamp"), keys);
  }

  const keyList: KeyItem[] = [
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
  ];

  return (
    <SecuritySettingsContext.Provider
      value={{
        wallet: currentWallet,
        draft,
        keyList,
        keyMetaData,
        setKeyMetaData,
        navigationStack,
        pushPage,
        popPage,
      }}
    >
      <SecuritySettingsPageHandler />
    </SecuritySettingsContext.Provider>
  );
});

const SecuritySettingsPageHandler = observer(
  function SecuritySettingsPageHandler() {
    const { navigationStack } = useSecuritySettingsContext();
    const [firstPage] = navigationStack;

    if (!firstPage) return <SecuritySettingsIndex />;

    switch (firstPage.type) {
      case "key-type":
        return <SecuritySettingsKeyTypePage page={firstPage} />;
      case "key-item":
        return <SecuritySettingsKeyItemPage page={firstPage} />;
      case "key-add":
        return <SecuritySettingsKeyAddPage page={firstPage} />;
    }
  },
);
