import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { KeyMetaData, SingleKeyMetaData } from "@/stores/key-meta-data";
import { walletDataToMultisigKey } from "@/wallet-data-flow/state";
import { Base58EncodedString } from "@obi-wallet/encoding";
import {
  BackupShare,
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
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { Context, Data, Effect, Ref, SubscriptionRef } from "effect";
import { z } from "zod";

export enum WalletDataFlowStateType {
  Initial = "Initial",
  NoWalletFound = "NoWalletFound",
  WalletData = "WalletData",
  CommitData = "CommitData",
  SetWalletData = "SetWalletData",
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
    | SetWalletDataState
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
        yield* Ref.update(state, (_) => {
          return new WalletDataState({
            recoverKeyPublicKey: payload.publicKey,
            recoverKeyMetaData: payload.keyMetaData,
            walletData: wallet,
          });
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

export class WalletDataState extends Data.TaggedClass(
  WalletDataFlowStateType.WalletData,
)<{
  recoverKeyPublicKey: Secp256k1PublicKey;
  keyMetaData: KeyMetaData;
  walletData: WalletData;
  owner: MultisigKey;
}> {
  public constructor(data: {
    recoverKeyPublicKey: Secp256k1PublicKey;
    recoverKeyMetaData: SingleKeyMetaData | null;
    walletData: WalletData;
  }) {
    const owner = walletDataToMultisigKey({
      homeChainId: data.walletData.homeChainId,
      wallet: data.walletData,
    });
    const recoverKey = owner.findKeyByPublicKey(data.recoverKeyPublicKey);
    if (
      recoverKey &&
      (recoverKey.type === KeyType.Passkey || recoverKey.type === KeyType.Cloud)
    ) {
      owner.setPrimaryKey(recoverKey);
    }
    const keyMetaData = data.recoverKeyMetaData
      ? {
          [data.recoverKeyPublicKey.value]: data.recoverKeyMetaData,
        }
      : {};
    super({ ...data, owner, keyMetaData });
  }

  public setDecryptedData(data: {
    easyShare: EasyShare;
    backupShare: BackupShare;
    keyMetaData: KeyMetaData;
    // TODO: handle that. If there isn't an ed25519KeyPair yet, we should add it.
    ed25519KeyPair: Ed25519KeyPair | null;
  }) {
    return Effect.gen(this, function* () {
      const state = yield* WalletDataFlowState;
      const nextState = yield* CommitDataState.decryptedData({
        owner: this.owner,
        walletData: this.walletData,
        ...data,
      });
      yield* Ref.update(state, () => {
        return nextState;
      });
      yield* Effect.void;
    });
  }

  public cancel() {
    return Effect.gen(this, function* () {
      const state = yield* WalletDataFlowState;
      yield* Ref.update(state, () => {
        return new InitialState({
          chainId: this.walletData.homeChainId,
        });
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
    ed25519KeyPair: Ed25519KeyPair | null;
    walletData: WalletData;
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

        if (ed25519KeyPair) {
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
          const ed25519KeyPair = generateEd25519KeyPair();
          const encryptedEd25519KeyPair = {
            publicKey: ed25519KeyPair.publicKey.value,
            encryptedPrivateKey: yield* Effect.promise(() => {
              return encryptionTools.encryptWithMultisigKey({
                multisigKey: owner,
                data: ed25519KeyPair.privateKey,
              });
            }),
          };
          const nextWalletData = {
            ...walletData,
            ed25519KeyPair: encryptedEd25519KeyPair,
            revision: walletData.revision + 1,
          };
          return new SetWalletDataState({
            owner,
            wallet: {
              homeChain: walletData.homeChainId,
              owner: owner.toJSON(),
              userEntryAddress: walletData.userEntryAddress,
              encryptedShares: {
                easy,
                backup,
              },
              ed25519KeyPair: encryptedEd25519KeyPair,
              previousWalletData: nextWalletData,
            },
            walletData: nextWalletData,
            keyMetaData,
          });
        }
      } else {
        return new SecuritySettingsState();
        // 3) If we have no primary key, we need to proceed to security settings
        // Proceed to security settings
      }
    });
  }
}

export class SetWalletDataState extends Data.TaggedClass(
  WalletDataFlowStateType.SetWalletData,
)<{
  owner: MultisigKey;
  wallet: z.infer<typeof MpcWalletSchema>;
  walletData: WalletData & {
    ed25519KeyPair: {
      publicKey: Base58EncodedString;
      encryptedPrivateKey: MultisigKeyEncryptedData;
    };
  };
  keyMetaData: KeyMetaData;
}> {}

export class SecuritySettingsState extends Data.TaggedClass(
  WalletDataFlowStateType.SecuritySettings,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
)<{}> {}

export class DoneState extends Data.TaggedClass(WalletDataFlowStateType.Done)<{
  wallet: z.infer<typeof MpcWalletSchema>;
  keyMetaData: KeyMetaData;
}> {}
