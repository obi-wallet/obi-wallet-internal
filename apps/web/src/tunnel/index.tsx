"use client";

import { useEffectState } from "@/effect/effect-state";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { observer } from "mobx-react-lite";

import { ChooseAssetState, TunnelState, TunnelStateType } from "./state";
import { ChooseAddress } from "./state-handler/choose-address";
import { ChooseAsset } from "./state-handler/choose-asset";
import { TunnelServiceState } from "./state-handler/choose-asset/tunnel-service";
import { Status } from "./state-handler/status";

export interface TunnelEmbedProps {
  from?: Caip19AssetId | undefined;
  to?: Caip19AssetId | undefined;
}

export const TunnelEmbed = observer<TunnelEmbedProps>(function TunnelEmbed({
  from = "cosmos:phoenix-1/native:uluna",
  to = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:DEf93bSt8dx58gDFCcz4CwbjYZzjwaRBYAciJYLfdCA9",
}: TunnelEmbedProps) {
  const { state, dispatch } = useEffectState(
    TunnelState,
    new ChooseAssetState({
      from,
      to,
    }),
  );

  // Function to override error messages in demo mode
  const overrideErrorState = (
    state: TunnelServiceState,
  ): TunnelServiceState => {
    if (state.status === "error") {
      // Log original error for debugging
      console.log("Original error intercepted:", state.error);

      // Return state with custom error message
      return {
        ...state,
        error: "RPC calls are disabled in demo mode.",
      };
    }
    return state;
  };

  //   const handleSubmit = async () => {
  //     console.log("Submitting...", window.opener, window.parent);
  //     if (window.opener) {
  //       window.opener.postMessage({ type: "TUNNEL_COMPLETE" }, "*");
  //     }
  //     if (window.parent) {
  //       window.parent.postMessage({ type: "TUNNEL_COMPLETE" }, "*");
  //     }
  //   };

  if (state._tag === TunnelStateType.ChooseAsset) {
    return (
      <ChooseAsset
        state={state}
        dispatch={dispatch}
        overrideErrorState={overrideErrorState}
      />
    );
  }
  if (state._tag === TunnelStateType.ChooseAddress) {
    return <ChooseAddress state={state} dispatch={dispatch} />;
  }
  if (state._tag === TunnelStateType.Status) {
    return <Status state={state} dispatch={dispatch} />;
  }
});
