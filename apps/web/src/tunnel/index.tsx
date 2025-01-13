"use client";

import { Text } from "@/components";
import { EffectStateDispatch, useEffectState } from "@/effect/effect-state";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { AssetDropdown } from "./asset-dropdown";
import {
  ChooseAddressState,
  ChooseAssetState,
  StatusState,
  TunnelState,
  TunnelStateType,
} from "./state";
import { TunnelService, TunnelServiceState } from "./tunnel-service";

export const TunnelEmbed = observer(function TunnelEmbed() {
  const { state, dispatch } = useEffectState(
    TunnelState,
    new ChooseAssetState(),
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
    return <Deposit state={state} dispatch={dispatch} />;
  }
});

export interface ChooseAssetProps {
  state: ChooseAssetState;
  dispatch: EffectStateDispatch<typeof TunnelState>;
}

const ChooseAsset = observer<ChooseAssetProps>(function ChooseAsset({
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
                // selectedItem={selectedAsset ?? undefined}
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

export interface ChooseAddressProps {
  state: ChooseAddressState;
  dispatch: EffectStateDispatch<typeof TunnelState>;
}

const ChooseAddress = observer<ChooseAddressProps>(function ChooseAddress({
  state,
  dispatch,
}) {
  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        {/* TODO: get asset name & amount */}
        Receive XXX $XYZ
      </Text>
      <Text className="mt-4">
        {/* TODO: label instead */}
        <span className="align-middle leading-normal">
          Connect your wallet:
        </span>
      </Text>
      <AsyncButton
        className="mt-2 w-full"
        variant="primary"
        // TODO: handle disabled state
        onClick={async () => {}}
      >
        Connect Phantom
      </AsyncButton>
      <AsyncButton
        className="mt-2 w-full"
        variant="primary"
        // TODO: handle disabled state
        onClick={async () => {
          console.log("continue");
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
        // value={field.value}
        // onChange={(recipient) => {
        //   field.onChange(recipient);
        // }}
      />
      <AsyncButton
        className="mt-2 w-full"
        variant="secondary"
        // TODO: handle disabled state
        onClick={async () => {
          await dispatch(state.setAddress());
        }}
      >
        Continue
      </AsyncButton>
    </div>
  );
});

export interface StatusProps {
  state: StatusState;
  dispatch: EffectStateDispatch<typeof TunnelState>;
}

const Deposit = observer<StatusProps>(function Deposit() {
  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        {/* TODO: get asset name & amount */}
        You are expected to receive XXX $XYZ
      </Text>
      <Text className="mt-4">
        {/* TODO: label instead */}
        <span className="align-middle leading-normal">Receiving address:</span>
      </Text>
      <AsyncButton
        className="mt-2 w-full"
        variant="primary"
        // TODO: handle disabled state
        onClick={async () => {
          console.log("continue");
        }}
      >
        XXXX
      </AsyncButton>
      <Text className="mt-4">
        {/* TODO: label instead */}
        <span className="align-middle leading-normal">
          Please send YYY $YXZ to the address below to complete the transaction:
        </span>
      </Text>
      <Input
        labelClassname="bg-background-secondary"
        className="mt-2 h-[48px] w-full rounded-[5px] border border-[#32c9af]"
        // TODO: handle value, copy-paste
        value="0x1234567890"
        // value={field.value}
        // onChange={(recipient) => {
        //   field.onChange(recipient);
        // }}
      />
      <AsyncButton
        className="mt-2 w-full"
        variant="outline"
        // TODO: handle disabled state
        onClick={async () => {
          console.log("continue");
        }}
      >
        Awaiting Deposit
      </AsyncButton>
    </div>
  );
});
