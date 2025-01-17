"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { useAssets } from "@/hooks/assets";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";

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
  const [isCopied, setIsCopied] = useState(false);

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
        <span className="align-middle leading-normal">Receiving address:</span>
      </Text>

      <Wallet
        onClick={async () => {
          await dispatch(state.back());
        }}
        label={state.to.address}
      />
      <label>
        <Text className="mt-4">
          <span className="align-middle leading-normal">
            Please send {state.from.prettyAmount}{" "}
            {fromAsset?.assetInfo?.symbol ?? fromAsset?.denom} to the address
            below to complete the transaction:
          </span>
        </Text>
        <Input
          labelClassname="bg-background-secondary"
          className="mt-2 h-[48px] w-full rounded-[5px] border border-[#32c9af]"
          value={state.from.address}
          readOnly
          rightComponent={
            <div className="flex w-full justify-end">
              <button
                onClick={() => {
                  copy(state.from.address);
                  setIsCopied(true);

                  setTimeout(() => {
                    setIsCopied(false);
                  }, 2000);
                }}
              >
                <img src="/assets/icons/copy.svg" alt="copy" />
              </button>
            </div>
          }
        />
      </label>
      {isCopied && (
        <div className="mt-2 flex items-center gap-2 text-green-500">
          <FaCheck />
          <p className="text-white">Copied</p>
        </div>
      )}
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
