import { SecretJsHomeChain } from "@/home-chain/secret-js";
import { HomeChainId, WalletData } from "@obi-wallet/sdk";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import invariant from "tiny-invariant";

export enum WalletDataFlowStateType {
  Initial = "initial",
  NoWalletsFound = "noWalletsFound",
  DecryptData = "decryptData",
}

export interface WalletDataFlowInitialState {
  type: WalletDataFlowStateType.Initial;
  payload: {
    chainId: HomeChainId;
  };
}

export interface WalletDataFlowNoWalletsFoundState {
  type: WalletDataFlowStateType.NoWalletsFound;
}

export interface WalletDataFlowDecryptDataState {
  type: WalletDataFlowStateType.DecryptData;
  payload: {
    recoverKeyPublicKey: Secp256k1PublicKey;
    walletData: WalletData;
  };
}

export type WalletDataFlowState =
  | WalletDataFlowInitialState
  | WalletDataFlowNoWalletsFoundState
  | WalletDataFlowDecryptDataState;

export interface SomeOtherAction {
  type: "someOtherAction";
}

export async function initialStateTransition(
  state: WalletDataFlowInitialState,
  recoverKeyPublicKey: Secp256k1PublicKey,
): Promise<WalletDataFlowNoWalletsFoundState | WalletDataFlowDecryptDataState> {
  const wallet = await new SecretJsHomeChain(
    state.payload.chainId,
  ).lookupWalletBackup({
    homeChainId: state.payload.chainId,
    publicKey: recoverKeyPublicKey,
  });

  if (!wallet) {
    return {
      type: WalletDataFlowStateType.NoWalletsFound,
    };
  }

  return {
    type: WalletDataFlowStateType.DecryptData,
    payload: {
      recoverKeyPublicKey,
      walletData: wallet,
    },
  };
}

export async function noWalletsFoundTransition(
  state: WalletDataFlowNoWalletsFoundState,
  _action: unknown,
): Promise<WalletDataFlowNoWalletsFoundState | WalletDataFlowDecryptDataState> {
  return state;
}

export async function decryptDataTransition(
  state: WalletDataFlowDecryptDataState,
  _action: unknown,
): Promise<WalletDataFlowNoWalletsFoundState | WalletDataFlowDecryptDataState> {
  return state;
}

export const transitions = {
  [WalletDataFlowStateType.Initial]: initialStateTransition,
  [WalletDataFlowStateType.NoWalletsFound]: noWalletsFoundTransition,
  [WalletDataFlowStateType.DecryptData]: decryptDataTransition,
};

export type WalletDataFlowDispatch = typeof initialStateTransition &
  typeof noWalletsFoundTransition &
  typeof decryptDataTransition;

export const dispatch: WalletDataFlowDispatch = async (state, action) => {
  invariant(state.type in transitions, "Invalid state");
  // @ts-expect-error Something TypeScript can't figure out completely
  return await transitions[state.type](state, action);
};
