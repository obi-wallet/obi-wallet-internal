import { KeyItems } from "@/components";
import { Draft } from "@/stores";
import { KeyMetaData, SingleKeyMetaData } from "@/stores/key-meta-data";
import {
  Key,
  KeyType,
  MpcWallet,
  MultisigKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

export interface KeyTypePage {
  type: "key-type";
  payload: KeyType;
}

export interface KeyItemPage {
  type: "key-item";
  payload: {
    id: string;
    label: string;
    key: Key;
  };
}

export interface KeyAddPage {
  type: "key-add";
  payload: KeyType;
}

export type Page = KeyTypePage | KeyItemPage | KeyAddPage;

export const SecuritySettingsContext = createContext<{
  wallet: MpcWallet;
  draft: Draft<MultisigKey>;
  keyList: KeyItems[];
  keyMetaData: KeyMetaData;
  setKeyMetaData(
    publicKey: Secp256k1PublicKey,
    singleKeyMetaData: SingleKeyMetaData,
  ): void;
  navigationStack: Page[];
  pushPage(page: Page): void;
  popPage(): void;
} | null>(null);

export function useSecuritySettingsContext() {
  const ctx = useContext(SecuritySettingsContext);
  invariant(ctx, "SecuritySettings context is null");
  return ctx;
}
