"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";

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
  const [s, setState] = useState<TunnelServiceState>({
    status: "idle",
    from: {
      asset: "",
      rawAmount: "",
    },
    to: {
      asset: "",
      rawAmount: "",
    },
  });
  const [service, _] = useState(() => {
    return new TunnelService((state) => {
      setState(state);
    });
  });
  console.log({ s });

  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        Deposit your asset here to receive $XYZ
      </Text>

      <div className="mt-6 flex flex-col">
        <label htmlFor="assetAmount" className="mb-2">
          <Text size="sm" className="text-gray-200">
            How much are you depositing?
          </Text>
        </label>
        <Input
          id="assetAmount"
          labelClassname="bg-background-secondary"
          className="h-[48px] w-full rounded-[5px] border border-[#32c9af]"
          placeholder="0.5"
          value={s.from.rawAmount}
          onChange={(value) => {
            service.setRawAmount(value);
          }}
          rightComponent={
            <div className="flex w-full justify-end">
              <AssetDropdown
                items={["ETH", "LUNA", "KWEEN"]}
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
      </div>

      <div className="mt-6 flex flex-col">
        <label htmlFor="expectedReceive" className="mb-2">
          <Text size="sm" className="text-gray-200">
            You are expected to receive:
          </Text>
        </label>
        <Input
          id="expectedReceive"
          labelClassname="bg-background-secondary"
          className="h-[48px] w-full rounded-[5px] border border-[#32c9af]"
          placeholder="0.5"
          value={s.status === "done" ? s.to.rawAmount : ""}
        />
      </div>

      <AsyncButton
        className="mt-8 w-full"
        variant="secondary"
        disabled={s.status !== "done"}
        onClick={async () => {
          await dispatch(state.setSimulationResponse());
        }}
      >
        {s.status === "simulating" ? "Simulating..." : "Continue"}
      </AsyncButton>
    </div>
  );
});
