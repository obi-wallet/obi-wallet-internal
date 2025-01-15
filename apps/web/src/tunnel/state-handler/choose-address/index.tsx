"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { useAlert } from "@/hooks/alert";
import { useAssets } from "@/hooks/assets";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { WalletProviders } from "./wallet-providers";
import { ChooseAddressState, TunnelState } from "../../state";

export interface ChooseAddressProps {
  state: ChooseAddressState;
  dispatch: EffectStateDispatch<typeof TunnelState>;
}

export const ChooseAddress = observer<ChooseAddressProps>(
  function ChooseAddress({ state, dispatch }) {
    const [s, setState] = useState<string>("");
    const [walletProviders, _] = useState(() => {
      return new WalletProviders(state.to.asset);
    });
    const alert = useAlert();

    const assets = useAssets([state.from.asset, state.to.asset]);
    const fromAsset = assets[state.from.asset];
    const toAsset = assets[state.to.asset];

    if (!fromAsset || !toAsset) {
      return null;
    }

    return (
      <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
        <Text size="xl" className="flex items-center gap-2">
          Receive {state.to.prettyAmount} $
          {toAsset.assetInfo?.symbol ?? toAsset.denom}
        </Text>
        <Text className="mt-4">
          <span className="align-middle leading-normal">
            Connect your wallet:
          </span>
        </Text>
        <AsyncButton
          className="mt-2 w-full"
          variant="primary"
          // TODO: handle disabled state
          onClick={async () => {
            const res = await walletProviders.connectPhantom();
            if (res.success) {
              setState(res.address);
            } else {
              alert.showError(res.error);
            }
          }}
        >
          Connect Phantom
        </AsyncButton>
        <AsyncButton
          className="mt-2 w-full"
          variant="primary"
          // TODO: handle disabled state
          onClick={async () => {
            const res = await walletProviders.connectObi();
            if (res.success) {
              setState(res.address);
            } else {
              alert.showError(res.error);
            }
          }}
        >
          Connect Obi
        </AsyncButton>
        <Text className="mt-4">
          {/* TODO: label instead */}
          <span className="align-middle leading-normal">
            Or paste an address:
          </span>
        </Text>
        <Input
          labelClassname="bg-background-secondary"
          className="mt-2 h-[48px] w-full rounded-[5px] border border-[#32c9af]"
          placeholder="Paste your address here"
          value={s}
          onChange={(e) => {
            return setState(e);
          }}
        />
        <AsyncButton
          className="mt-2 w-full"
          variant="secondary"
          disabled={!walletProviders.targetChain.validateAddress(s)}
          onClick={async () => {
            // TODO: Simulate again to get deposit address
            await dispatch(
              state.setAddress({
                fromAddress: s,
                toAddress: s,
              }),
            );
          }}
        >
          Continue
        </AsyncButton>
      </div>
    );
  },
);
