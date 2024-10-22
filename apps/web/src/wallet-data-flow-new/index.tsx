import { SecretJsHomeChainId } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import {
  InitialState,
  WalletDataFlowState,
  WalletDataFlowStateType,
} from "./state";
import { FirstKeyStep } from "./state-handler/first-key";

export const WalletDataFlow = observer(function WalletDataFlow() {
  const [state, setState] = useState<WalletDataFlowState>(
    new InitialState({ chainId: SecretJsHomeChainId.MAINNET }),
  );

  if (
    state._tag === WalletDataFlowStateType.Initial ||
    state._tag === WalletDataFlowStateType.NoWalletFound
  ) {
    return <FirstKeyStep state={state} setState={setState} />;
  }

  return null;
});
