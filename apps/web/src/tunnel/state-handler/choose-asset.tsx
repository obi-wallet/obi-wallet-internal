"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { useQuery } from "@obi-wallet/headless-ui";
import { AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import BigNumber from "bignumber.js";
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
      asset: "",
      rawAmount: "",
    },
    to: {
      asset: "",
      rawAmount: "",
    },
  });
  const [service, _] = useState(() => {
    return new TunnelService(state.to, (state) => {
      if (isMounted()) {
        setState(state);
      }
    });
  });

  const toAsset = useQuery({
    queryKey: ["to-asset", state.to],
    queryFn: async () => {
      return await AssetRegistry.getInstance().byId(state.to);
    },
  });

  if (!toAsset.data) {
    return null;
  }

  const toSymbol = toAsset.data.assetInfo?.symbol ?? toAsset.data.denom;
  const toAmount = new BigNumber(s.to.rawAmount)
    .dividedBy(10 ** (toAsset.data.assetInfo?.decimals ?? 0))
    .toString();

  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        Deposit your asset here to receive ${toSymbol}
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
              ? `${toAmount} ${toSymbol}`
              : ""}
        </div>
      </div>

      <AsyncButton
        className="mt-8 w-full"
        variant="secondary"
        disabled={s.status !== "done"}
        onClick={async () => {
          await dispatch(state.setSimulationResponse());
        }}
      >
        Continue
      </AsyncButton>
    </div>
  );
});
