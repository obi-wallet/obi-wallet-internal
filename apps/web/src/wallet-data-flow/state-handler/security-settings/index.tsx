"use client";

import { useKeyListForMultisigKey } from "@/lib/keys";
import { SingleKeyMetaData } from "@/stores/key-meta-data";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import {
  Page,
  SecuritySettingsContext,
  useSecuritySettingsContext,
} from "./context";
import { SecuritySettingsIndex } from "./page";
import { SecuritySettingsKeyAddPage } from "./page/key-add";
import { SecuritySettingsKeyItemPage } from "./page/key-item";
import { SecuritySettingsKeyTypePage } from "./page/key-type";

export const SecuritySettings = observer(function SecuritySettings() {
  const { state } = useWalletDataFlowContext();
  const [navigationStack, setNavigationStack] = useState<Page[]>([]);

  const keyMetaData = state.keyMetaDataDraft.value.value;
  const keyList = useKeyListForMultisigKey({
    multisigKey: state.ownerDraft.value,
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

  const setKeyMetaData = (
    publicKey: Secp256k1PublicKey,
    singleKeyMetaData: SingleKeyMetaData,
  ) => {
    state.keyMetaDataDraft.value.set({
      ...keyMetaData,
      [publicKey.value]: {
        ...keyMetaData[publicKey.value],
        ...singleKeyMetaData,
      },
    });
  };

  return (
    <SecuritySettingsContext.Provider
      value={{
        draft: state.ownerDraft,
        keyMetaDataDraft: state.keyMetaDataDraft,
        keyList,
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
