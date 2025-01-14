"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";

import { StatusState, TunnelState } from "../state";

export interface StatusProps {
  state: StatusState;
  dispatch: EffectStateDispatch<typeof TunnelState>;
}

export const Status = observer<StatusProps>(function Deposit() {
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
