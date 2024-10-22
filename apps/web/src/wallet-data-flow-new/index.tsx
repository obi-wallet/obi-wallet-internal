import { MOCK_PRIMARY_KEY_KEYPAIR } from "@/mocks/multisig-key";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import {
  transitions,
  WalletDataFlowState,
  WalletDataFlowStateType,
} from "./state";
import { FirstKeyStep } from "./state-handler/first-key";

export const WalletDataFlow = observer(function WalletDataFlow() {
  const [state, setState] = useState<WalletDataFlowState>({
    type: WalletDataFlowStateType.Initial,
    payload: {
      chainId: SecretJsHomeChainId.MAINNET,
    },
  });

  if (state.type === WalletDataFlowStateType.Initial) {
    return (
      <FirstKeyStep
        state={state}
        onChooseKey={async () => {
          const nextState = await transitions[state.type](
            state,
            MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
          );
          setState(nextState);
          return nextState;
        }}
      />
    );
  }

  return null;
});
