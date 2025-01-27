"use client";

import { Modal, renderModal, Text } from "@/components";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <button
          onClick={async () => {
            await dispatch(state.back());
          }}
          className="ml-2 px-1"
        >
          <FaRegCircleXmark title="Disconnect" />
        </button>
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

      <a
        className="text-primary mt-2 underline hover:cursor-pointer"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Having trouble with Terra Station?
      </a>

      {isModalOpen
        ? renderModal(
            <Modal
              title=""
              boxClassname="h-fit w-[560px] !min-w-[320px] px-4 py-6 max-md:w-[90%] max-sm:w-[400px]"
              onClose={() => {
                setIsModalOpen(false);
              }}
            >
              <div className="bg-background flex flex-col gap-6 p-6 text-white">
                <h2 className="text-xl font-normal">
                  Changing Endpoints in Terra Station
                </h2>

                <img
                  src="/assets/images/0253820d6d20cd40a0553cc31d654b94.jpeg"
                  alt="Terra Station: Add LCD Endpoint"
                />

                <div className="space-y-4 text-sm font-normal">
                  <p>
                    If balances in your Station wallet aren't loading or
                    transactions are failing, connect to a different endpoint in
                    the Station extension.
                  </p>

                  <ol className="list-inside list-decimal">
                    <li>
                      In the Station wallet, go to Settings › Network and click
                      Add Custom LCD Endpoint.
                    </li>
                    <li>
                      Choose Terra and paste your LCD address in the Custom URL
                      box. Use{" "}
                      <a
                        className="text-primary underline hover:cursor-pointer"
                        onClick={() => {
                          copy("https://terra-api.cosmosrescue.dev:8443");
                        }}
                      >
                        https://terra-api.cosmosrescue.dev:8443
                      </a>{" "}
                      or another Terra REST endpoint from{" "}
                      <a
                        href="https://cosmos.directory/terra2/nodes"
                        className="text-primary underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://cosmos.directory/terra2/nodes
                      </a>
                      .
                    </li>
                    <li>
                      Once you see a green Valid message, save your new
                      settings.
                    </li>
                  </ol>
                  <p>
                    Note: This does not function on the Station web dashboard.
                    You must use the mobile app or browser extension.
                  </p>
                </div>
              </div>
            </Modal>,
          )
        : null}

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
    </div>
  );
});

function toTitleCase(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace("Ibc", "IBC");
}
