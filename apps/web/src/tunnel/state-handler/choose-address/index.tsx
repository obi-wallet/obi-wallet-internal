"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";

import { ChooseAddressState, TunnelState } from "../../state";

export interface ChooseAddressProps {
  state: ChooseAddressState;
  dispatch: EffectStateDispatch<typeof TunnelState>;
}

export const ChooseAddress = observer<ChooseAddressProps>(
  function ChooseAddress({ state, dispatch }) {
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
  },
);
