import { EffectStateValue, useEffectState } from "@/hooks/use-effect-state";
import { KeyMetaData } from "@/stores/key-meta-data";
import { SecuritySettings } from "@/wallet-data-flow-new/state-handler/security-settings";
import { UpdateOwner } from "@/wallet-data-flow-new/state-handler/update-owner";
import { MpcWalletSchema } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { z } from "zod";

import { WalletDataFlowState, WalletDataFlowStateType } from "./state";
import { DecryptData } from "./state-handler/decrypt-data";
import { FirstKeyStep } from "./state-handler/first-key";

export interface WalletDataFlowProps {
  initialState: EffectStateValue<typeof WalletDataFlowState>;
  onDone({
    wallet,
    keyMetaData,
  }: {
    wallet: z.infer<typeof MpcWalletSchema>;
    keyMetaData: KeyMetaData;
  }): void;
}

export const WalletDataFlow = observer<WalletDataFlowProps>(
  function WalletDataFlow(props) {
    const { state, dispatch } = useEffectState(
      WalletDataFlowState,
      props.initialState,
      {
        isFinalState: (state) => {
          return state._tag === WalletDataFlowStateType.Done;
        },
        onDone: async (state) => {
          props.onDone({
            wallet: state.wallet,
            keyMetaData: state.keyMetaData,
          });
        },
      },
    );

    if (
      state._tag === WalletDataFlowStateType.Initial ||
      state._tag === WalletDataFlowStateType.NoWalletFound
    ) {
      return <FirstKeyStep state={state} dispatch={dispatch} />;
    }

    if (state._tag === WalletDataFlowStateType.WalletData) {
      return <DecryptData state={state} dispatch={dispatch} />;
    }

    if (state._tag === WalletDataFlowStateType.SecuritySettings) {
      return <SecuritySettings state={state} dispatch={dispatch} />;
    }

    if (state._tag === WalletDataFlowStateType.UpdateOwner) {
      return <UpdateOwner state={state} dispatch={dispatch} />;
    }
  },
);
