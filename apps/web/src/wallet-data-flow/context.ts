import {
  WalletDataFlowDispatch,
  WalletDataFlowState,
} from "@/wallet-data-flow/state";
import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

export interface WalletDataFlowContextValue {
  state: WalletDataFlowState;
  dispatch: WalletDataFlowDispatch;
}

export const WalletDataFlowContext =
  createContext<WalletDataFlowContextValue | null>(null);

export function useWalletDataFlowContext() {
  const ctx = useContext(WalletDataFlowContext);
  invariant(ctx, "WalletDataFlow context is null");
  return ctx;
}
