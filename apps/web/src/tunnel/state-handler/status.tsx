"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { useAssets } from "@/hooks/assets";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";

import { StatusState, TunnelState } from "../state";
import { GenericWallet, ObiWallet, PhantomWallet } from "../wallets";

export interface StatusProps {
  state: StatusState;
  dispatch: EffectStateDispatch<typeof TunnelState>;
}

export const Status = observer<StatusProps>(function Deposit({
  state,
  dispatch,
}) {
  const assets = useAssets([state.from.asset, state.to.asset]);
  const fromAsset = assets[state.from.asset];
  const toAsset = assets[state.to.asset];

  const Wallet =
    state.walletType === "phantom"
      ? PhantomWallet
      : state.walletType === "obi"
        ? ObiWallet
        : GenericWallet;

  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        You are expected to receive {state.to.prettyAmount} $
        {toAsset?.assetInfo?.symbol ?? toAsset?.denom}
      </Text>
      <Text className="mt-4">
        {/* TODO: handle wallet type */}
        {/* TODO: label instead */}
        <span className="align-middle leading-normal">Receiving address:</span>
      </Text>

      <Wallet
        onClick={async () => {
          await dispatch(state.back());
        }}
        label={state.to.address}
      />
      <Text className="mt-4">
        {/* TODO: label instead */}
        <span className="align-middle leading-normal">
          Please send {state.from.prettyAmount}{" "}
          {fromAsset?.assetInfo?.symbol ?? fromAsset?.denom} to the address
          below to complete the transaction:
        </span>
      </Text>
      <Input
        labelClassname="bg-background-secondary"
        className="mt-2 h-[48px] w-full rounded-[5px] border border-[#32c9af]"
        // TODO: handle value, copy-paste
        value={state.from.address}
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
