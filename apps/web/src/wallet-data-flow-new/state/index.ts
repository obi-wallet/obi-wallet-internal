import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { KeyMetaData, SingleKeyMetaData } from "@/stores/key-meta-data";
import { walletDataToMultisigKey } from "@/wallet-data-flow/state";
import {
  BackupShare,
  EasyShare,
  HomeChainId,
  KeyType,
  MultisigKey,
  WalletData,
} from "@obi-wallet/sdk";
import { Ed25519KeyPair } from "@obi-wallet/sdk-ed25519";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { Context, Data, Effect, Ref, SubscriptionRef } from "effect";

export enum WalletDataFlowStateType {
  Initial = "Initial",
  NoWalletFound = "NoWalletFound",
  WalletData = "WalletData",
  Done = "Done",
}

export class WalletDataFlowState extends Context.Tag("WalletDataFlowState")<
  WalletDataFlowState,
  SubscriptionRef.SubscriptionRef<
    InitialState | NoWalletFoundState | WalletDataState | DoneState
  >
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

  public setDecryptedData(_data: {
    easyShare: EasyShare;
    backupShare: BackupShare;
    keyMetaData: KeyMetaData;
    // TODO: handle that. If there isn't an ed25519KeyPair yet, we should add it.
    ed25519KeyPair: Ed25519KeyPair | null;
  }) {
    return Effect.gen(this, function* () {
      // TODO: here we have three cases:
      // 1) If we have a primary key and an ed25519KeyPair, we are done (previously: finishFlow)
      // 2) If we have a primary key but no ed25519KeyPair, we need to generate one and then update the wallet data accordingly (set data)
      // 3) If we have no primary key, we need to proceed to security settings
      const state = yield* WalletDataFlowState;
      yield* Ref.update(state, () => {
        return new DoneState();
      });
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

export class DoneState extends Data.TaggedClass(WalletDataFlowStateType.Done) {}
