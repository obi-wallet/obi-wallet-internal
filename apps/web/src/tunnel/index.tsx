"use client";

import { useEffectState } from "@/effect/effect-state";
import { observer } from "mobx-react-lite";

import { ChooseAssetState, TunnelState, TunnelStateType } from "./state";
import { ChooseAddress } from "./state-handler/choose-address";
import { ChooseAsset } from "./state-handler/choose-asset";
import { Status } from "./state-handler/status";

export const TunnelEmbed = observer(function TunnelEmbed() {
  const { state, dispatch } = useEffectState(
    TunnelState,
    new ChooseAssetState({
      to: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:DEf93bSt8dx58gDFCcz4CwbjYZzjwaRBYAciJYLfdCA9",
    }),
    // new ChooseAddressState({
    //   previousState: new ChooseAssetState({
    //     to: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:DEf93bSt8dx58gDFCcz4CwbjYZzjwaRBYAciJYLfdCA9",
    //   }),
    // }),
  );

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
    return <ChooseAsset state={state} dispatch={dispatch} />;
  }
  if (state._tag === TunnelStateType.ChooseAddress) {
    return <ChooseAddress state={state} dispatch={dispatch} />;
  }
  if (state._tag === TunnelStateType.Status) {
    return <Status state={state} dispatch={dispatch} />;
  }
});
