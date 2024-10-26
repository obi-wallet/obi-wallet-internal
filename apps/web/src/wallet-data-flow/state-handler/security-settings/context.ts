import { KeyItems } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { Draft } from "@/stores";
import { SingleKeyMetaData } from "@/stores/key-meta-data";
import {
  SecuritySettingsState,
  WalletDataFlowState,
} from "@/wallet-data-flow/state";
import { KeyMetaDataContainer } from "@/wallet-data-flow/state/key-meta-data-container";
import {
  KeySchema,
  KeyType,
  MultisigKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";
import { createContext, useContext } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

export interface KeyTypePage {
  type: "key-type";
  payload: KeyType;
}

export interface KeyItemPage {
  type: "key-item";
  payload: {
    id: string;
    label: string;
    key: z.infer<typeof KeySchema>;
  };
}

export interface KeyAddPage {
  type: "key-add";
  payload: KeyType;
}

export type Page = KeyTypePage | KeyItemPage | KeyAddPage;

export const SecuritySettingsContext = createContext<{
  state: SecuritySettingsState;
  dispatch: EffectStateDispatch<typeof WalletDataFlowState>;
  draft: Draft<MultisigKey>;
  keyMetaDataDraft: Draft<KeyMetaDataContainer>;
  keyList: KeyItems[];
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
