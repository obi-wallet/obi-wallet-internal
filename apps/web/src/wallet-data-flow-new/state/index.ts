import { HomeChain } from "@/home-chain";
import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { Draft } from "@/stores";
import { KeyMetaData, SingleKeyMetaData } from "@/stores/key-meta-data";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import {
  KeyMetaDataContainer,
  walletDataToMultisigKey,
} from "@/wallet-data-flow/state";
import { Base58EncodedString, Encoding } from "@obi-wallet/encoding";
import {
  BackupShare,
  createHash,
  EasyShare,
  EncryptedBackupShare,
  EncryptedEasyShareForBackup,
  EncryptedEasyShareForClient,
  HomeChainId,
  KeyType,
  MpcWalletSchema,
  MultisigKey,
  MultisigKeyEncryptedData,
  WalletData,
} from "@obi-wallet/sdk";
import {
  Ed25519KeyPair,
  generateEd25519KeyPair,
} from "@obi-wallet/sdk-ed25519";
import { deserialize, serialize } from "@obi-wallet/sdk-json";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { Context, Data, Effect, Ref, SubscriptionRef } from "effect";
import { z } from "zod";

export type WalletWithEd25519KeyPair = z.infer<typeof MpcWalletSchema> & {
  ed25519KeyPair: {
    publicKey: Base58EncodedString;
    encryptedPrivateKey: MultisigKeyEncryptedData;
  };
};

export type WalletDataWithEd25519KeyPair = WalletData & {
  ed25519KeyPair: {
    publicKey: Base58EncodedString;
    encryptedPrivateKey: MultisigKeyEncryptedData;
  };
};

export enum WalletDataFlowStateType {
  Initial = "Initial",
  NoWalletFound = "NoWalletFound",
  WalletData = "WalletData",
  CommitData = "CommitData",
  SecuritySettings = "SecuritySettings",
  Done = "Done",
}

export class WalletDataFlowState extends Context.Tag("WalletDataFlowState")<
  WalletDataFlowState,
  SubscriptionRef.SubscriptionRef<
    | InitialState
    | NoWalletFoundState
    | WalletDataState
    | CommitDataState
    | SecuritySettingsState
    | DoneState
  >
>() {}

export interface IEncryptionTools {
  encryptSharesForClient: (payload: {
    multisigKey: MultisigKey;
    easy: EasyShare;
    backup: BackupShare;
  }) => Promise<{
    easy: EncryptedEasyShareForClient;
    backup: EncryptedBackupShare;
  }>;
  encryptSharesForBackup: (payload: {
    multisigKey: MultisigKey;
    easy: EasyShare;
    backup: BackupShare;
  }) => Promise<{
    easy: EncryptedEasyShareForBackup;
    backup: EncryptedBackupShare;
  }>;
  encryptWithMultisigKey: (payload: {
    multisigKey: MultisigKey;
    data: string;
  }) => Promise<MultisigKeyEncryptedData>;
  handleIntentions: (payload: {
    multisigKey: MultisigKey;
    intentionsPayload: IntentionsPayload;
    results: IntentionsResults;
  }) => Promise<{
    decryptedEasyShare: EasyShare | null;
    decryptedPrimaryKeyEncryptedMessages: string[];
    decryptedMultisigKeyEncryptedMessages: string[];
  }>;
}

export class EncryptionTools extends Context.Tag("EncryptionTools")<
  EncryptionTools,
  IEncryptionTools
>() {}

export class InitialState extends Data.TaggedClass(
  WalletDataFlowStateType.Initial,
)<{
  chainId: HomeChainId;
}> {
  public recoverByPublicKey(payload: {
    publicKey: Secp256k1PublicKey;
    keyMetaData: SingleKeyMetaData | null;
  }) {
    return Effect.gen(this, function* () {
      const state = yield* WalletDataFlowState;
      const wallet = yield* Effect.promise(() => {
        return new SecretJsHomeChain(this.chainId).lookupWalletBackup({
          homeChainId: this.chainId,
          publicKey: payload.publicKey,
        });
      });
      if (wallet) {
        const nextState = yield* WalletDataState.recover({
          recoverKeyPublicKey: payload.publicKey,
          recoverKeyMetaData: payload.keyMetaData,
          walletData: wallet,
        });
        yield* Ref.update(state, (_) => {
          return nextState;
        });
      } else {
        yield* Ref.update(state, () => {
          return new NoWalletFoundState({
            chainId: this.chainId,
          });
        });
      }
    });
  }
}

export class NoWalletFoundState extends Data.TaggedClass(
  WalletDataFlowStateType.NoWalletFound,
)<{
  chainId: HomeChainId;
}> {
  public retry() {
    return Effect.gen(this, function* () {
      const state = yield* WalletDataFlowState;
      yield* Ref.update(state, () => {
        return new InitialState({
          chainId: this.chainId,
        });
      });
    });
  }
}

export enum WalletDataFlow {
  Recovery = "Recovery",
  Backup = "Backup",
}

export class WalletDataState extends Data.TaggedClass(
  WalletDataFlowStateType.WalletData,
)<{
  keyMetaData: KeyMetaData;
  walletData: WalletDataWithEd25519KeyPair;
  serializedWalletData: string | null;
  owner: MultisigKey;
  previousState: InitialState | SecuritySettingsState;
}> {
  public static recover(data: {
    recoverKeyPublicKey: Secp256k1PublicKey;
    recoverKeyMetaData: SingleKeyMetaData | null;
    walletData: WalletData;
  }) {
    return Effect.gen(function* () {
      const owner = walletDataToMultisigKey({
        homeChainId: data.walletData.homeChainId,
        wallet: data.walletData,
      });
      const recoverKey = owner.findKeyByPublicKey(data.recoverKeyPublicKey);
      console.log("recoverKey", recoverKey);
      if (
        recoverKey &&
        (recoverKey.type === KeyType.Passkey ||
          recoverKey.type === KeyType.Cloud)
      ) {
        owner.setPrimaryKey(recoverKey);
      }
      const keyMetaData = data.recoverKeyMetaData
        ? {
            [data.recoverKeyPublicKey.value]: data.recoverKeyMetaData,
          }
        : {};

      if (data.walletData.ed25519KeyPair) {
        return new WalletDataState({
          walletData: {
            ...data.walletData,
            ed25519KeyPair: data.walletData.ed25519KeyPair,
          },
          serializedWalletData: null,
          owner,
          keyMetaData,
          previousState: new InitialState({
            chainId: data.walletData.homeChainId,
          }),
        });
      } else {
        return yield* WalletDataState.from({
          walletData: data.walletData,
          owner,
          keyMetaData,
          previousState: new InitialState({
            chainId: data.walletData.homeChainId,
          }),
        });
      }
    });
  }

  public static from(data: {
    owner: MultisigKey;
    walletData: WalletData;
    keyMetaData: KeyMetaData;
    previousState: InitialState | SecuritySettingsState;
  }) {
    return Effect.gen(function* () {
      if (data.walletData.ed25519KeyPair) {
        return new WalletDataState({
          walletData: {
            ...data.walletData,
            ed25519KeyPair: data.walletData.ed25519KeyPair,
          },
          serializedWalletData: serialize(data.walletData),
          owner: data.owner,
          keyMetaData: data.keyMetaData,
          previousState: data.previousState,
        });
      }

      const encryptionTools = yield* EncryptionTools;
      const ed25519KeyPair = generateEd25519KeyPair();
      const encryptedEd25519KeyPair = {
        publicKey: ed25519KeyPair.publicKey.value,
        encryptedPrivateKey: yield* Effect.promise(() => {
          return encryptionTools.encryptWithMultisigKey({
            multisigKey: data.owner,
            data: ed25519KeyPair.privateKey,
          });
        }),
      };
      const walletData = {
        ...data.walletData,
        ed25519KeyPair: encryptedEd25519KeyPair,
        revision: data.walletData.revision + 1,
      };
      return new WalletDataState({
        walletData,
        serializedWalletData: serialize(walletData),
        owner: data.owner,
        keyMetaData: data.keyMetaData,
        previousState: data.previousState,
      });
    });
  }

  public get intentionsPayload(): IntentionsPayload {
    return {
      signHashes: this.serializedWalletData
        ? [createHash(Encoding.fromUtf8(this.serializedWalletData).toBytes())]
        : [],
      decryptEasyShare: null,
      decryptMessages: [],
      decryptPrimaryKeyEncryptedMessages: [],
      decryptMultisigKeyEncryptedMessages: this.multisigKeyEncryptedMessages,
    };
  }

  protected get multisigKeyEncryptedMessages() {
    const encryptedKeyMetaData = this.walletData.encryptedKeyMetaData;
    const encryptedEasyShare = this.walletData.encryptedShares.easy;
    const encryptedBackupShare = this.walletData.encryptedShares.backup;
    const encryptedEd25519PrivateKey =
      this.walletData.ed25519KeyPair.encryptedPrivateKey;

    return [
      ...(encryptedKeyMetaData ? [encryptedKeyMetaData] : []),
      ...(encryptedEasyShare ? [encryptedEasyShare] : []),
      encryptedBackupShare,
      encryptedEd25519PrivateKey,
    ];
  }

  public setIntentionsResults(results: IntentionsResults) {
    return Effect.gen(this, function* () {
      console.log(results);

      const encryptionTools = yield* EncryptionTools;
      const {
        decryptedMultisigKeyEncryptedMessages: [
          keyMetaDataRaw,
          firstShareRaw,
          secondShareRaw,
          ed25519PrivateKeyRaw,
        ],
      } = yield* Effect.promise(async () => {
        return await encryptionTools.handleIntentions({
          multisigKey: this.owner,
          intentionsPayload: this.intentionsPayload,
          results,
        });
      });

      if (this.serializedWalletData) {
        console.log(this.walletData);
        const userAccount = yield* Effect.promise(async () => {
          const homeChain = HomeChain.chainId(this.walletData.homeChainId);
          const userEntryCodeHash = await homeChain.userEntryCodeHash(
            this.walletData.userEntryAddress,
          );
          return await homeChain.userAccount({
            userEntryAddress: this.walletData.userEntryAddress,
            userEntryCodeHash,
          });
        });

        const signatures = [...results.values()]
          .map((value) => {
            return value.signedHashes[0];
          })
          .filter((signature): signature is Uint8Array => {
            return !!signature;
          })
          .map((signature) => {
            return Encoding.fromBytes(signature).toHex();
          });

        yield* Effect.promise(async () => {
          return await fetch("/api/set-wallet-data", {
            method: "POST",
            body: serialize({
              serializedWalletData: this.serializedWalletData,
              signatures,
              userAccountAddress: userAccount.userAccountAddress,
              userAccountCodeHash: userAccount.userAccountCodeHash,
            }),
          });
        });
      }

      const ed25519KeyPair: Ed25519KeyPair = {
        publicKey: {
          type: "tendermint/PubKeyEd25519",
          value: this.walletData.ed25519KeyPair.publicKey,
        },
        privateKey: Base58EncodedString.parse(ed25519PrivateKeyRaw),
      };

      if (keyMetaDataRaw && firstShareRaw && secondShareRaw) {
        const easyShare = EasyShare.parse(deserialize(firstShareRaw));
        const backupShare = BackupShare.parse(deserialize(secondShareRaw));
        const keyMetaData = KeyMetaData.parse(deserialize(keyMetaDataRaw));

        const state = yield* WalletDataFlowState;
        const nextState = yield* CommitDataState.decryptedData({
          owner: this.owner,
          walletData: this.walletData,
          easyShare,
          backupShare,
          keyMetaData,
          ed25519KeyPair,
        });
        yield* Ref.update(state, () => {
          return nextState;
        });
      }
    });
  }

  public cancel() {
    return Effect.gen(this, function* () {
      const state = yield* WalletDataFlowState;
      yield* Ref.update(state, () => {
        return this.previousState;
      });
    });
  }
}

export class CommitDataState extends Data.TaggedClass(
  WalletDataFlowStateType.CommitData,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
)<{}> {
  static decryptedData({
    owner,
    easyShare,
    backupShare,
    keyMetaData,
    ed25519KeyPair,
    walletData,
  }: {
    owner: MultisigKey;
    easyShare: EasyShare;
    backupShare: BackupShare;
    keyMetaData: KeyMetaData;
    ed25519KeyPair: Ed25519KeyPair;
    walletData: WalletDataWithEd25519KeyPair;
  }) {
    return Effect.gen(function* () {
      if (owner.primaryKey) {
        const encryptionTools = yield* EncryptionTools;
        const { easy, backup } = yield* Effect.promise(() => {
          return encryptionTools.encryptSharesForClient({
            multisigKey: owner,
            easy: easyShare,
            backup: backupShare,
          });
        });

        return new DoneState({
          wallet: {
            homeChain: walletData.homeChainId,
            owner: owner.toJSON(),
            userEntryAddress: walletData.userEntryAddress,
            encryptedShares: {
              easy,
              backup,
            },
            ed25519KeyPair: {
              publicKey: ed25519KeyPair.publicKey.value,
              encryptedPrivateKey: yield* Effect.promise(() => {
                return encryptionTools.encryptWithMultisigKey({
                  multisigKey: owner,
                  data: ed25519KeyPair.privateKey,
                });
              }),
            },
            previousWalletData: walletData,
          },
          keyMetaData,
        });
      } else {
        return SecuritySettingsState.from({
          walletData,
          keyMetaData,
          owner,
        });
      }
    });
  }
}

export class SecuritySettingsState extends Data.TaggedClass(
  WalletDataFlowStateType.SecuritySettings,
)<{
  walletData: WalletData;
  keyMetaDataDraft: Draft<KeyMetaDataContainer>;
  ownerDraft: Draft<MultisigKey>;
}> {
  static from(payload: {
    walletData: WalletData;
    keyMetaData: KeyMetaData;
    owner: MultisigKey;
  }) {
    return new SecuritySettingsState({
      walletData: payload.walletData,
      keyMetaDataDraft: new Draft({
        original: new KeyMetaDataContainer(payload.keyMetaData),
      }),
      ownerDraft: new Draft({ original: payload.owner }),
    });
  }

  public commitDraft({
    // TODO: here we have two cases, depending on whether we have a wallet with
    // a primary key or not.
    // If primary key: we more or less have the whole wallet data already
    // No primary key: we can only work with backup-encrypted shares.
    // Question: does this stuff work if we only work with backup-encrypted shares?
    walletData,
    ownerDraft,
    keyMetaDataDraft,
  }: {
    walletData: WalletData;
    ownerDraft: Draft<MultisigKey>;
    keyMetaDataDraft: Draft<KeyMetaDataContainer>;
  }) {
    return Effect.gen(this, function* () {
      if (ownerDraft.value.address === ownerDraft.original.address) {
        const nextState = yield* WalletDataState.from({
          walletData,
          owner: ownerDraft.value,
          keyMetaData: keyMetaDataDraft.value.value,
          previousState: this,
        });
        yield* Ref.update(yield* WalletDataFlowState, () => {
          return nextState;
        });
      } else {
        // update owner flow, possibly with a new ed25519 key pair
        // decrypt on propose, encrypt on confirm
        console.log("update owner flow");
      }
      yield* Effect.void;
    });
  }
}

export class DoneState extends Data.TaggedClass(WalletDataFlowStateType.Done)<{
  wallet: WalletWithEd25519KeyPair;
  keyMetaData: KeyMetaData;
}> {}
