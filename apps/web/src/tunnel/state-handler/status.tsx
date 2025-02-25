"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { useAssets } from "@/hooks/assets";
import { cn } from "@/lib/utils";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { useQuery } from "@obi-wallet/headless-ui";
import { deserialize } from "@obi-wallet/sdk-json";
import copy from "copy-to-clipboard";
import { Effect } from "effect";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  FaArrowsRotate,
  FaCheck,
  FaClock,
  FaRegCircleXmark,
} from "react-icons/fa6";

import { getTransactionsBy } from "../fast-travel-worker";
import { StatusState, TunnelState } from "../state";
import { TerraStationModal } from "../terra-station-modal";

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

  const status = useQuery({
    queryKey: ["status", state.to],
    queryFn: async () => {
      return await Effect.runPromise(
        getTransactionsBy({
          recipientAddress: state.to.address,
          publicKey: state.to.publicKey,
        }),
      );
    },
    refetchInterval: 5000,
  });

  const transaction = status.data?.find((transaction) => {
    const intent = deserialize(transaction.transaction.intent);
    return (
      transaction.transaction.deposit_address === state.from.address &&
      intent.destinationAddress === state.to.address
    );
  });
  const rawTransactionStatus = transaction?.transaction.status;
  const currentStepIndex = parseInt(
    transaction?.transaction.status.match(/InProgress\((\d+)\)/)?.[1] ?? "0",
    10,
  );
  const transactionStatus = rawTransactionStatus
    ? toTitleCase(rawTransactionStatus)
    : null;
  const _steps = transaction?.step_statuses.length;

  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        You are expected to receive {state.to.prettyAmount} $
        {toAsset?.assetInfo?.symbol ?? toAsset?.denom}
      </Text>

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
          inputClassName="text-primary"
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
                <img src="/assets/icons/copy.svg" alt="Copy" title="Copy" />
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

      <Text className="mt-8">
        <span className="align-middle leading-normal">Receiving address:</span>
      </Text>
      <Text className="mt-2">
        {state.to.address}{" "}
        {currentStepIndex === 0 ? (
          <button
            onClick={async () => {
              await dispatch(state.back());
            }}
            className="ml-2 px-1"
          >
            <FaRegCircleXmark title="Disconnect" />
          </button>
        ) : null}
      </Text>

      <AsyncButton
        className={cn("mt-8 w-full", {
          "cursor-not-allowed": transactionStatus !== "Done",
        })}
        variant="outline"
        disabled={transactionStatus !== "Done"}
        onClick={async () => {
          console.log("continue");
        }}
      >
        {transactionStatus ? transactionStatus : "Awaiting Deposit"}
        {transactionStatus === "Done" ? null : (
          <FaArrowsRotate className="ml-2 animate-spin" />
        )}
      </AsyncButton>

      <TerraStationModal />

      {currentStepIndex > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          <Text size="sm" className="text-gray-400">
            Transaction Steps:
          </Text>
          {transaction?.step_statuses.map((step, index) => {
            return (
              <div
                key={index}
                className="bg-background-secondary flex items-center gap-2 rounded-md p-2"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-sm">
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <Text size="sm">{toTitleCase(step.action)}</Text>
                </div>
                <div className="ml-auto">
                  {index < currentStepIndex ? (
                    <FaCheck className="text-green-500" />
                  ) : index === currentStepIndex ? (
                    <FaArrowsRotate className="animate-spin" />
                  ) : (
                    <FaClock className="text-gray-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});

function toTitleCase(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace("Ibc", "IBC");
}
