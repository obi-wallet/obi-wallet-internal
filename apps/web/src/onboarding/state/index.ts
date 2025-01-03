import { EffectState } from "@/effect/effect-state";
import { EncryptionTools } from "@/effect/encryption-tools-layer";
import { easyShareToSecp256k1PublicKey } from "@/mpc";
import { rootStore } from "@/stores";
import {
  EncryptedNetworkShare,
  HomeChainId,
  KeyType,
  LocalMpcWalletSchema,
  MultisigKey,
  ObservableMpcWallet,
} from "@obi-wallet/sdk";
import { generateEd25519KeyPair } from "@obi-wallet/sdk-ed25519";
import { serialize } from "@obi-wallet/sdk-json";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { Context, Data, Effect } from "effect";
import invariant from "tiny-invariant";
import { z } from "zod";

export enum OnboardingStateType {
  Initial = "Initial",
  PrimaryKey = "PrimaryKey",
  CreateWallet = "CreateWallet",
}

export class OnboardingState extends Context.Tag("OnboardingState")<
  OnboardingState,
  EffectState<InitialState | PrimaryKeyState | CreateWalletState>
>() {}

export class InitialState extends Data.TaggedClass(
  OnboardingStateType.Initial,
)<{
  chainId: HomeChainId;
  initialName: string;
}> {
  public setName(name: string) {
    return Effect.gen(this, function* () {
      const state = yield* OnboardingState;
      yield* state.set((_) => {
        return new PrimaryKeyState({
          chainId: this.chainId,
          name,
          previousState: new InitialState({
            chainId: this.chainId,
            initialName: name,
          }),
        });
      });
    });
  }
}

export class PrimaryKeyState extends Data.TaggedClass(
  OnboardingStateType.PrimaryKey,
)<{
  chainId: HomeChainId;
  name: string;
  previousState: InitialState;
}> {
  public setPrimaryKey(key: {
    type: KeyType.Passkey | KeyType.Cloud;
    payload: Secp256k1PublicKey;
  }) {
    return Effect.gen(this, function* () {
      const state = yield* OnboardingState;
      yield* state.set((_) => {
        return new CreateWalletState({
          chainId: this.chainId,
          name: this.name,
          primaryKey: key,
        });
      });
    });
  }

  public back() {
    return Effect.gen(this, function* () {
      const state = yield* OnboardingState;
      yield* state.set((_) => {
        return this.previousState;
      });
    });
  }
}

export class CreateWalletState extends Data.TaggedClass(
  OnboardingStateType.CreateWallet,
)<{
  chainId: HomeChainId;
  name: string;
  primaryKey: {
    type: KeyType.Passkey | KeyType.Cloud;
    payload: Secp256k1PublicKey;
  };
}> {
  public createLocalWallet() {
    return Effect.gen(this, function* () {
      const shares = yield* Effect.promise(() => {
        invariant(rootStore.current, "Root store is not initialized");
        return rootStore.current.mpcStore.getShares();
      });

      const multisigKey = MultisigKey.create(this.chainId);
      const newKey = (() => {
        switch (this.primaryKey.type) {
          case KeyType.Passkey:
            return multisigKey.addPasskeyKey(this.primaryKey.payload);
          case KeyType.Cloud:
            return multisigKey.addCloudKey(this.primaryKey.payload);
          default:
            throw new Error(
              `Unsupported primary key type: ${this.primaryKey.type}`,
            );
        }
      })();
      multisigKey.setPrimaryKey(newKey);

      const secp256k1PublicKey = easyShareToSecp256k1PublicKey(
        shares.easyShare,
      );

      const encryptionTools = yield* EncryptionTools;
      const { easy, backup } = yield* Effect.promise(() => {
        return encryptionTools.encryptSharesForClient({
          multisigKey,
          easy: shares.easyShare,
          backup: shares.backupShare,
        });
      });
      const network = yield* Effect.promise(async () => {
        return EncryptedNetworkShare.parse(
          await encryptionTools.encryptWithMultisigKey({
            multisigKey,
            data: serialize(shares.networkShare),
          }),
        );
      });

      const ed25519KeyPair = generateEd25519KeyPair();
      const encryptedEd25519PrivateKey = yield* Effect.promise(() => {
        return encryptionTools.encryptWithMultisigKey({
          multisigKey,
          data: ed25519KeyPair.privateKey,
        });
      });

      const walletData: z.infer<typeof LocalMpcWalletSchema> = {
        homeChain: this.chainId,
        owner: multisigKey.toJSON(),
        userEntryAddress: null,
        encryptedShares: {
          easy,
          backup,
          network,
        },
        secp256k1KeyPair: {
          publicKey: secp256k1PublicKey.value,
        },
        ed25519KeyPair: {
          publicKey: ed25519KeyPair.publicKey.value,
          encryptedPrivateKey: encryptedEd25519PrivateKey,
        },
        previousWalletData: null,
      };
      const wallet = ObservableMpcWallet.create(
        LocalMpcWalletSchema.parse(walletData),
      );

      invariant(rootStore.current, "Root store is not initialized");
      rootStore.current.userDataStore.setUserData(wallet.id, {
        name: this.name,
      });
      void rootStore.current.homeAccountSetupStore.setupHomeAccount({
        wallet,
        shares,
      });
      rootStore.current.mpcWalletsStore.upsertWallet(wallet);
      void rootStore.current.analyticsStore.trackOnboarding();
    });
  }
}
