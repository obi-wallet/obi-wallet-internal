import { WalletDataFlowContext } from "@/wallet-data-flow/context";
import {
  useWalletDataFlowState,
  WalletDataFlowStatePayload,
} from "@/wallet-data-flow/state";
import { observer } from "mobx-react-lite";
import { WalletDataFlowStateHandler } from "src/wallet-data-flow/state-handler";

export const WalletDataFlow = observer<WalletDataFlowStatePayload>(
  function WalletDataFlow(props) {
    const [state, dispatch] = useWalletDataFlowState(props);

    return (
      <WalletDataFlowContext.Provider
        value={{
          state,
          dispatch,
        }}
      >
        <WalletDataFlowStateHandler />
      </WalletDataFlowContext.Provider>
    );
  },
);
