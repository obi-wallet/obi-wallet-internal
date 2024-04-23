import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import { DecryptData } from "@/wallet-data-flow/state-handler/decrypt-data";
import { FirstKeyStep } from "@/wallet-data-flow/state-handler/first-key";
import { SecuritySettings } from "@/wallet-data-flow/state-handler/security-settings";
import { UpdateOwner } from "@/wallet-data-flow/state-handler/update-owner";
import { observer } from "mobx-react-lite";

export const WalletDataFlowStateHandler = observer(
  function WalletDataFlowStateHandler() {
    const { state } = useWalletDataFlowContext();
    const { walletData } = state;

    if (!walletData) {
      return <FirstKeyStep />;
    }

    if (!state.shares && !state.locallyEncryptedSharesByPreviousOwner) {
      return <DecryptData walletData={walletData} />;
    }

    if (!state.updateOwnerInteraction) {
      return <SecuritySettings />;
    }

    return <UpdateOwner walletData={walletData} />;
  },
);
