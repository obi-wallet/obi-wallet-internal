import { useEffectState } from "@/hooks/use-effect-state";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

import {
  InitialState,
  WalletDataFlowState,
  WalletDataFlowStateType,
} from "./state";
import { FirstKeyStep } from "./state-handler/first-key";

export const WalletDataFlow = observer(function WalletDataFlow() {
  const { state, dispatch } = useEffectState(
    WalletDataFlowState,
    new InitialState({
      chainId: SecretJsHomeChainId.MAINNET,
    }),
  );

  console.log(state._tag);

  if (
    state._tag === WalletDataFlowStateType.Initial ||
    state._tag === WalletDataFlowStateType.NoWalletFound
  ) {
    return <FirstKeyStep state={state} dispatch={dispatch} />;
  }

  return null;
});
