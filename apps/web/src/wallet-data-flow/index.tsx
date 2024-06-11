import { WalletDataFlowContext } from "@/wallet-data-flow/context";
import {
  useWalletDataFlowState,
  WalletDataFlowStatePayload,
} from "@/wallet-data-flow/state";
import { WalletDataFlowStateHandler } from "@/wallet-data-flow/state-handler";
import { observer } from "mobx-react-lite";

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
