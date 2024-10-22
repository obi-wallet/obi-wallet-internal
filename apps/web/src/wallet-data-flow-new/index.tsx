import { Text } from "@/components";
import { MOCK_PRIMARY_KEY_KEYPAIR } from "@/mocks/multisig-key";
import { AsyncButton } from "@/ui/button";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import {
  dispatch,
  WalletDataFlowState,
  WalletDataFlowStateType,
} from "./state";

export const WalletDataFlow = observer(function WalletDataFlow() {
  const [state, setState] = useState<WalletDataFlowState>({
    type: WalletDataFlowStateType.Initial,
    payload: {
      chainId: SecretJsHomeChainId.MAINNET,
    },
  });

  console.log(state);

  if (state.type === WalletDataFlowStateType.Initial) {
    return (
      <>
        <Text>First Key</Text>
        <AsyncButton
          onClick={async () => {
            setState(await dispatch(state, MOCK_PRIMARY_KEY_KEYPAIR.publicKey));
          }}
        >
          Mock first key
        </AsyncButton>
      </>
    );
  }

  return null;
});
