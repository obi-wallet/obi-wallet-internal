import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { HomeChainId, WalletData } from "@obi-wallet/sdk";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { Data } from "effect";

export enum WalletDataFlowStateType {
  Initial = "initial",
  NoWalletFound = "noWalletFound",
  DecryptData = "decryptData",
}

export class InitialState extends Data.TaggedClass(
  WalletDataFlowStateType.Initial,
)<{
  chainId: HomeChainId;
}> {
  public async setRecoverPublicKey(recoverKeyPublicKey: Secp256k1PublicKey) {
    const wallet = await new SecretJsHomeChain(this.chainId).lookupWalletBackup(
      {
        homeChainId: this.chainId,
        publicKey: recoverKeyPublicKey,
      },
    );
    if (wallet) {
      return new DecryptDataState({
        recoverKeyPublicKey,
        walletData: wallet,
      });
    } else {
      return new NoWalletFoundState({ chainId: this.chainId });
    }
  }
}

export class NoWalletFoundState extends Data.TaggedClass(
  WalletDataFlowStateType.NoWalletFound,
)<{ chainId: HomeChainId }> {
  public closeModal() {
    return new InitialState({ chainId: this.chainId });
  }
}

export class DecryptDataState extends Data.TaggedClass(
  WalletDataFlowStateType.DecryptData,
)<{
  recoverKeyPublicKey: Secp256k1PublicKey;
  walletData: WalletData;
}> {}

export type WalletDataFlowState =
  | InitialState
  | NoWalletFoundState
  | DecryptDataState;
