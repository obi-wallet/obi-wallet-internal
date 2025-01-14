"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { useAssets } from "@/hooks/assets";
import { TargetChain } from "@/target-chain";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useGetIsMounted } from "rooks";

import { AssetDropdown } from "../asset-dropdown";
import { ChooseAssetState, TunnelState } from "../state";
import { TunnelService, TunnelServiceState } from "../tunnel-service";

export interface ChooseAssetProps {
  state: ChooseAssetState;
  dispatch: EffectStateDispatch<typeof TunnelState>;
}

export const ChooseAsset = observer<ChooseAssetProps>(function ChooseAsset({
  state,
  dispatch,
}) {
  const isMounted = useGetIsMounted();
  const [s, setState] = useState<TunnelServiceState>({
    status: "idle",
    from: {
      asset: null,
      prettyAmount: "",
    },
  });
  const [service, _] = useState(() => {
    return new TunnelService(state.to, (state) => {
      if (isMounted()) {
        setState(state);
      }
    });
  });

  const assets = useAssets([state.to, ...(s.from.asset ? [s.from.asset] : [])]);
  const toAsset = assets[state.to];

  if (!toAsset) {
    return null;
  }

  const fromAsset = s.from.asset ? assets[s.from.asset] : null;
  const toSymbol = toAsset.assetInfo?.symbol ?? toAsset.denom;

  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        Deposit your {fromAsset?.assetInfo?.symbol ?? "asset"} here to receive $
        {toSymbol}
      </Text>

      <div className="mt-6 flex flex-col">
        <label>
          <Text size="sm" className="mb-2 text-gray-200">
            How much are you depositing?
          </Text>
          <Input
            id="assetAmount"
            labelClassname="bg-background-secondary"
            className="h-[48px] w-full rounded-[5px] border border-[#32c9af]"
            placeholder="0.5"
            value={s.from.prettyAmount}
            onChange={(value) => {
              service.setPrettyAmount(value);
            }}
            rightComponent={
              <div className="flex w-full justify-end">
                <AssetDropdown
                  items={[
                    TargetChain.chainId(Eip155ChainId.Ethereum)
                      .nativeCaip19AssetId,
                  ]}
                  selectedItem={s.from.asset || null}
                  onSelectedItemChange={(value) => {
                    console.log(value);
                    if (value) {
                      service.setAsset(value);
                    }
                  }}
                />
              </div>
            }
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col">
        <Text size="sm" className="mb-2 text-gray-200">
          You are expected to receive:
        </Text>
        <div className="bg-background-secondary flex h-[48px] w-full items-center rounded-[5px] border border-[#32c9af] px-6">
          {s.status === "simulating"
            ? "Simulating…"
            : s.status === "done"
              ? `${s.to.prettyAmount} ${toSymbol}`
              : ""}
        </div>
      </div>

      <AsyncButton
        className="mt-8 w-full"
        variant="secondary"
        disabled={s.status !== "done"}
        onClick={async () => {
          if (s.status === "done") {
            await dispatch(
              state.setSimulationResponse({
                from: s.from,
                to: s.to,
              }),
            );
          }
        }}
      >
        Continue
      </AsyncButton>
    </div>
  );
});
