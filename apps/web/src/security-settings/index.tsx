"use client";

import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { useKeyListForMultisigKey } from "@/lib/keys";
import {
  Page,
  SecuritySettingsContext,
  useSecuritySettingsContext,
} from "@/security-settings/context";
import { SecuritySettingsIndex } from "@/security-settings/page";
import { SecuritySettingsKeyAddPage } from "@/security-settings/page/key-add";
import { SecuritySettingsKeyItemPage } from "@/security-settings/page/key-item";
import { SecuritySettingsKeyTypePage } from "@/security-settings/page/key-type";
import { SingleKeyMetaData } from "@/stores/key-meta-data";
import { MultisigKey, Secp256k1PublicKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

export const SecuritySettings = observer(function SecuritySettings() {
  const currentWallet = useCurrentWallet({});
  const draftId = `security-${currentWallet?.userEntryAddress}`;
  const { draftsStore, keyMetaDataStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const [navigationStack, setNavigationStack] = useState<Page[]>([]);
  const keyMetaData = currentWallet
    ? keyMetaDataStore.getKeyMetaData(currentWallet.userEntryAddress)
    : {};
  const keyList = useKeyListForMultisigKey({
    multisigKey: draft?.value,
    keyMetaData,
  });

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
