import { Draft } from "@/stores";
import { KeyMetaData } from "@/stores/key-meta-data";
import { Base58EncodedString } from "@obi-wallet/encoding";
import {
  BackupShare,
  EasyShare,
  EncryptedBackupShare,
  EncryptedEasyShareForClient,
  HomeChainId,
  KeyType,
  MpcWallet,
  MpcWalletSchema,
  MultisigKey,
  MultisigKeyEncryptedData,
  ObservableMultisigKey,
  Serialized,
  WalletData,
} from "@obi-wallet/sdk";
import { Ed25519KeyPair } from "@obi-wallet/sdk-ed25519";
import { serialize } from "@obi-wallet/sdk-json";
import { action, observable, toJS } from "mobx";
import { Dispatch, useReducer } from "react";
import { z } from "zod";

export class KeyMetaDataContainer {
  @observable
  protected accessor _value: KeyMetaData;

  public constructor(value: KeyMetaData) {
    this._value = value;
  }

  public clone() {
    return new KeyMetaDataContainer({ ...this.value });
  }

  public equals(other: this): boolean {
    return serialize(toJS(this.value)) === serialize(toJS(other.value));
  }

  public get value() {
    return this._value;
  }

  @action
  public set(value: KeyMetaData) {
    this._value = value;
  }
}

export enum UpdateOwnerStep {
  Propose = "propose",
  Approve = "approve",
}

export interface WalletDataFlowState {
  mockOnly: boolean;
  ownerDraft: Draft<MultisigKey>;
  keyMetaDataDraft: Draft<KeyMetaDataContainer>;
  walletData: WalletData | null;
  shares: {
    easy: EasyShare;
    backup: BackupShare;
  } | null;
  locallyEncryptedSharesByPreviousOwner: {
    easy: EncryptedEasyShareForClient;
    backup: EncryptedBackupShare;
  } | null;
  ed25519KeyPair: Ed25519KeyPair | null;
  ed25519KeyPairPreviousOwner: {
    publicKey: Base58EncodedString;
    encryptedPrivateKey: MultisigKeyEncryptedData;
  } | null;
  onDone({
    wallet,
    keyMetaData,
  }: {
    wallet: z.infer<typeof MpcWalletSchema>;
    keyMetaData: KeyMetaData;
  }): void;
  onBack(): void;
  updateOwnerInteraction: boolean;
}

export type WalletDataFlowAction =
  | {
      type: "set-wallet-data";
      payload: {
        wallet: WalletData;
        modifyMultisigKey?: ((multisigKey: MultisigKey) => void) | undefined;
        extraKeyMetaData?: KeyMetaData;
      };
    }
  | {
      type: "reject-decrypt-wallet-data";
    }
  | {
      type: "approve-decrypt-wallet-data";
      payload: {
        easyShare: EasyShare;
        backupShare: BackupShare;
        keyMetaData: KeyMetaData;
        ed25519KeyPair: Ed25519KeyPair | null;
      };
    }
  | {
      type: "update-owner";
    }
  | {
      type: "reject-update-owner";
    };

export type WalletDataFlowDispatch = Dispatch<WalletDataFlowAction>;

export function walletDataToMultisigKey({
  homeChainId,
  wallet,
}: {
  homeChainId: HomeChainId;
  wallet: WalletData;
}): MultisigKey {
  const multisigKey = ObservableMultisigKey.create(homeChainId);
  wallet.owner.keys.forEach((key) => {
    switch (key.type) {
      case KeyType.Passkey:
        multisigKey.addPasskeyKey(key.publicKey);
        break;
      case KeyType.Phone:
        multisigKey.addPhoneKey(key.publicKey);
        break;
      case KeyType.Telegram:
        multisigKey.addTelegramKey(key.publicKey);
        break;
      case KeyType.Cloud:
        multisigKey.addCloudKey(key.publicKey);
        break;
    }
  });
  return multisigKey;
}

export function walletDataFlowStateReducer(
  state: WalletDataFlowState,
  action: WalletDataFlowAction,
): WalletDataFlowState {
  switch (action.type) {
    case "set-wallet-data": {
      const { wallet, modifyMultisigKey, extraKeyMetaData } = action.payload;
      const multisigKey = walletDataToMultisigKey({
        homeChainId: state.ownerDraft.value.chainId,
        wallet,
      });
      if (typeof modifyMultisigKey === "function") {
        modifyMultisigKey(multisigKey);
      }

      if (extraKeyMetaData) {
        state.keyMetaDataDraft.value.set(extraKeyMetaData);
      }

      return {
        ...state,
        ownerDraft: new Draft({ original: multisigKey }),
        walletData: wallet,
      };
    }
    case "reject-decrypt-wallet-data":
      state.keyMetaDataDraft.reset();

      return {
        ...state,
        walletData: null,
      };
    case "approve-decrypt-wallet-data": {
      const { easyShare, backupShare, keyMetaData, ed25519KeyPair } =
        action.payload;

      state.keyMetaDataDraft.commit({
        original: new KeyMetaDataContainer(keyMetaData),
      });

      return {
        ...state,
        shares: {
          easy: easyShare,
          backup: backupShare,
        },
        ed25519KeyPair,
      };
    }
    case "update-owner":
      return {
        ...state,
        updateOwnerInteraction: true,
      };
    case "reject-update-owner":
      return {
        ...state,
        updateOwnerInteraction: false,
      };
  }
}

export interface WalletDataFlowStatePayload {
  homeChainId: HomeChainId;
  initialValues: {
    owner?: MultisigKey;
    newOwner?: MultisigKey;
    walletData?: WalletData;
    keyMetaData?: KeyMetaData;
    newKeyMetaData?: KeyMetaData;
    shares?: {
      easy: EasyShare;
      backup: BackupShare;
    };
    locallyEncryptedSharesByPreviousOwner?: {
      easy: EncryptedEasyShareForClient;
      backup: EncryptedBackupShare;
    };
    ed25519KeyPair?: Ed25519KeyPair;
    ed25519KeyPairPreviousOwner?:
      | {
          publicKey: Base58EncodedString;
          encryptedPrivateKey: MultisigKeyEncryptedData;
        }
      | undefined;
  };
  onDone({
    wallet,
    keyMetaData,
  }: {
    wallet: Serialized<typeof MpcWallet>;
    keyMetaData: KeyMetaData;
  }): void;
  onBack(): void;
  mockOnly?: boolean;
}

export function useWalletDataFlowState(
  payload: WalletDataFlowStatePayload,
): [WalletDataFlowState, WalletDataFlowDispatch] {
  return useReducer(
    walletDataFlowStateReducer,
    payload,
    ({
      homeChainId,
      initialValues,
      onBack,
      onDone,
      mockOnly,
    }): WalletDataFlowState => {
      const {
        owner,
        newOwner,
        walletData,
        keyMetaData,
        newKeyMetaData,
        shares,
        locallyEncryptedSharesByPreviousOwner,
        ed25519KeyPair,
        ed25519KeyPairPreviousOwner,
      } = initialValues;
      return {
        onBack,
        onDone,
        ownerDraft: new Draft<MultisigKey>({
          original: owner ?? ObservableMultisigKey.create(homeChainId),
          value: newOwner,
        }),
        keyMetaDataDraft: new Draft({
          original: new KeyMetaDataContainer(keyMetaData ?? {}),
          value: newKeyMetaData
            ? new KeyMetaDataContainer(newKeyMetaData)
            : undefined,
        }),
        walletData: walletData ?? null,
        shares: shares ?? null,
        locallyEncryptedSharesByPreviousOwner:
          locallyEncryptedSharesByPreviousOwner ?? null,
        ed25519KeyPair: ed25519KeyPair ?? null,
        ed25519KeyPairPreviousOwner: ed25519KeyPairPreviousOwner ?? null,
        updateOwnerInteraction: !!newOwner,
        mockOnly: mockOnly ?? false,
      };
    },
  );
}
