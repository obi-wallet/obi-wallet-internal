import { toAssets } from "@/dashboard/assets";
import { getTokenPrice, usePendingTXs } from "@/hooks/balances";
import { usePublicKey } from "@/hooks/use-public-key";
import { cn, getFromChain, getToChain } from "@/lib/utils";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { toPairs } from "ramda";
import { useEffect, useState } from "react";

import {
  Transaction,
  SimulationEntryObject,
  SkipStatus,
  SquidStatus,
  StepStatus,
  EmptyObject,
  StepSimulations,
  SquidRouteFromChain,
  SquidRouteToChain,
  OnlySquidStepSimulation,
  NullStepSimulation,
  SquidStepSimulation,
} from "./schema";

type StepAndTx = StepStatus & {
  transaction: Transaction;
};

export const PendingAssets = observer(function PendingAssets() {
  const publicKey = usePublicKey();

  const pendingTXs = usePendingTXs(publicKey?.value ?? "");
  const [openedAsset, setOpenedAsset] = useState<string | null>(null);

  if (!pendingTXs.data) return null;
  const onlyPending = pendingTXs.data.filter((t) => {
    return (
      t.transaction.status.includes("InProgress") ||
      t.transaction.status.includes("LowBalance")
    );
  });
  return (
    <>
      {onlyPending.map((tx) => {
        return (
          <PendingAsset
            key={tx.transaction.deposit_address}
            tx={tx}
            onOpen={(addr) => {
              if (addr === openedAsset) {
                setOpenedAsset(null);
                return;
              }
              setOpenedAsset(addr);
            }}
            opened={openedAsset === tx.transaction.deposit_address}
          />
        );
      })}
    </>
  );
});

const PendingAsset = observer<{
  tx: SimulationEntryObject;
  opened: boolean;
  onOpen: (addr: string) => void;
}>(function PendingAsset({ tx, opened, onOpen }) {
  const asset =
    toAssets[
      Object.keys(toAssets).find((key) => {
        return toAssets[key]?.denom === tx.transaction.intent.destination_asset;
      }) ?? ""
    ];

  return (
    <>
      <div
        className="mb-3 mt-3 flex cursor-pointer flex-row items-center justify-between   rounded-lg bg-blue-950 p-5 hover:bg-gray-600"
        key={tx.transaction.deposit_address}
        onClick={() => {
          const status = tx.transaction.status;
          if (status.includes("InProgress") || status.includes("Done")) {
            onOpen && onOpen(tx.transaction.deposit_address);
            return;
          }
          return;
        }}
      >
        <div className="flex flex-row items-center">
          <div className="mr-3">
            <img
              src={asset?.image ?? ""}
              alt={asset?.label}
              className="h-8 w-8"
            />
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col">
              <div className="mr-5 text-lg">{asset?.label} </div>
              <div className="mr-5 text-xs  opacity-60">Pending tx</div>
            </div>
          </div>
        </div>
        <Status status={tx.transaction.status} />

        <PendingAmount tx={tx} />
      </div>
      {opened && <PendingStepList tx={tx} />}
    </>
  );
});
const renderSVG = (status: string) => {
  switch (status) {
    case "success":
      return <SuccessSVG />;
    case "ongoing":
      return <OnGoingSVG />;
    case "failed":
      return <FailedSVG />;
    default:
      return <OnGoingSVG />;
  }
};

const PendingStepList = observer<{
  tx: SimulationEntryObject;
}>(function PendingStepList({ tx }) {
  return (
    <div className="flex: flex-1 p-4 pt-1">
      <ol className="relative border-s border-gray-200 p-4 text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {tx.step_statuses.map((step) => {
          return (
            <PendingStepItem
              step={{ ...step, transaction: tx.transaction }}
              key={step.action}
              simulations={tx.step_simulations}
            />
          );
        })}
      </ol>
      <Status status={tx.transaction.status} />
    </div>
  );
});

function PendingStepItem({
  step,

  simulations,
}: {
  step: StepAndTx;
  simulations: StepSimulations;
}) {
  const renderSTEPIcon = () => {
    switch (step.action) {
      case "Squid": {
        return (
          <Image
            src="https://axelarscan.io/logos/accounts/squid.svg"
            alt=""
            width={30}
            height={30}
          />
        );
      }
      case "EthDeposit": {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#fff"
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
          >
            <path d="M19.6 21H4.4C3.1 21 2 19.9 2 18.6V14h2v4.2c0 .6.4.8 1 .8h14c.6 0 1-.4 1-1v-4h2v4.6c0 1.3-1.1 2.4-2.4 2.4z" />
            <path d="M15.3 12.1L13.4 14v-4c0-2 0-4.9 2.4-7-3.4.6-5.1 3.2-5.2 7v4l-1.9-1.9L7 13l5 5 5-5-1.7-.9z" />
          </svg>
        );
      }
      case "Skip": {
        return (
          <Image
            src="/assets/icons/skip.ico"
            alt="Skip"
            width={30}
            height={30}
          />
        );
      }
      default:
        return null;
    }
  };
  const getStepTitle = () => {
    switch (step.action) {
      case "EthDeposit": {
        const chain = getFromChain(step.chainId);

        return `Deposit ETH on ${chain?.label}`;
      }
      case "Squid": {
        if (Object.keys(step.status).length === 0) {
          return "Not started";
        }
        const fromChain = getFromChain(step.chainId);
        const chainId = step.transaction.intent.destination_chain_id;
        const chain = getToChain(chainId);
        if (chainId === "neutron-1") {
          return `Swap to USDC on ${fromChain?.label} (Squid)`;
        }

        const denom = step.transaction.intent.destination_asset;
        const asset = toPairs(toAssets).find(([, v]) => {
          return v.denom === denom;
        })?.[1];

        return `Swap to ${asset?.label} on ${chain.name} (Squid)`;
      }
      case "Skip": {
        const chainId = step.transaction.intent.destination_chain_id;
        const chain = getToChain(chainId);
        const denom = step.transaction.intent.destination_asset;
        const asset = toPairs(toAssets).find(([, v]) => {
          return v.denom === denom;
        })?.[1];
        return `Swap to ${asset?.label} on ${chain.name} (Skip)`;
      }
      default:
        return `Not implemented`;
    }
  };
  return (
    <li className="mb-10 ms-6">
      <span
        className={cn(
          "absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full ring-4  ring-white  dark:ring-gray-900",
          " bg-blue-950",
        )}
      >
        {renderSTEPIcon()}
      </span>
      <h3 className="font-medium  leading-tight">{getStepTitle()}</h3>
      <StepDetailsList step={step} simulations={simulations} />
    </li>
  );
}

function StepDetailsList({
  step,
  simulations,
}: {
  step: StepAndTx;
  simulations: StepSimulations;
}) {
  if (!step.action || step.action === "EthDeposit") return null;

  const renderStatus = () => {
    switch (step.action) {
      case "Squid": {
        const isEmpty = EmptyObject.safeParse(step.status);
        if (isEmpty.success) {
          return <div className=" text-md">Not started</div>;
        }

        const squidStatus = SquidStatus.safeParse(step.status);
        if (squidStatus.success) {
          return (
            <>
              <div className=" text-md uppercase">
                {squidStatus.data.squidTransactionStatus}
              </div>
              <div className="text-ellipsis  text-sm">
                TX hash:{" "}
                <a
                  href={squidStatus.data.axelarTransactionUrl}
                  target="_blank"
                  className="font-semibold hover:underline "
                  rel="noreferrer"
                >
                  {step.txHash}
                </a>
              </div>
            </>
          );
        } else {
          console.log("Error parsing squid status", squidStatus.error, step);
          return null;
        }
      }
      case "Skip": {
        return <SkipDetailsItem step={step} />;
      }
      default: {
        return null;
      }
    }
  };
  return (
    <div className="flex: flex-1 p-4 pt-1">
      {step.action !== "Skip" && (
        <StepDetailsItem step={step} simulations={simulations} />
      )}

      {renderStatus()}
    </div>
  );
}

function SkipDetailsItem({ step }: { step: StepAndTx }) {
  const skipStatus = SkipStatus.parse(step.status);
  const getSkipStatus = () => {
    switch (skipStatus.state) {
      case "STATE_COMPLETED":
        return "Completed";
      case "STATE_COMPLETED_SUCCESS":
        return "Completed";
      case "STATE_FAILED":
        return "Failed";
      default:
        return skipStatus.state;
    }
  };

  return <div className=" text-md"> {getSkipStatus()}</div>;
}

function StepDetailsItem({
  step,
  simulations,
}: {
  step: StepAndTx;
  simulations: StepSimulations;
}) {
  const isSkip = SkipStatus.safeParse(step.status);
  if (isSkip.success) return null;
  const squidSimulation = SquidStepSimulation.safeParse(simulations[1]);
  if (!squidSimulation.success) return null;
  const simulationData = squidSimulation.data;
  const squidRoutes = simulationData.estimate.route;
  if (!simulationData.estimate.route) return null;

  const routes = [...squidRoutes.fromChain, ...squidRoutes.toChain];
  const isEmpty = EmptyObject.safeParse(step.status);

  if (isEmpty.success) return null;

  const squidStatus = SquidStatus.safeParse(step.status);
  if (!squidStatus.success) {
    console.error("Error parsing squid status", squidStatus.error);
    return null;
  } else {
    const stepStatus = squidStatus.data;

    const getContent = (route: SquidRouteFromChain | SquidRouteToChain) => {
      const isFromChainRoute = SquidRouteFromChain.safeParse(route);
      if (isFromChainRoute.success) {
        const fromChainRoute = isFromChainRoute.data;
        const fromAmount = BigNumber(fromChainRoute.fromAmount)
          .dividedBy(10 ** fromChainRoute.fromToken.decimals)
          .toFixed(8);
        const toAmount = BigNumber(fromChainRoute.toAmount)
          .dividedBy(10 ** fromChainRoute.toToken.decimals)
          .decimalPlaces(8);
        return `${fromChainRoute.type.toUpperCase()} ${fromAmount} ${fromChainRoute.fromToken.name} to ${toAmount.toString()} ${fromChainRoute.toToken.name}`;
      }
      const isToChainRoute = SquidRouteToChain.safeParse(route);
      if (isToChainRoute.success) {
        switch (isToChainRoute.data.type) {
          case "Transfer": {
            return `TRANSFER ${isToChainRoute.data.fromToken.name} from ${isToChainRoute.data.fromChain} to ${isToChainRoute.data.toChain}`;
          }
          case "Swap": {
            const fromAmount = BigNumber(isToChainRoute.data.fromAmount)
              .dividedBy(10 ** isToChainRoute.data.fromToken.decimals)
              .decimalPlaces(8);
            const toAmount = BigNumber(isToChainRoute.data.toAmount)
              .dividedBy(10 ** isToChainRoute.data.toToken.decimals)
              .decimalPlaces(8);
            return `SWAP ${fromAmount.toString()} ${isToChainRoute.data.fromToken.name} to ${toAmount.toString()} ${isToChainRoute.data.toToken.name}`;
          }
          default: {
            return `not implemented `;
          }
        }
      }
    };

    return (
      <ol className="relative border-s border-gray-200 p-4 text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {routes.map((route, index) => {
          const routeStatus = stepStatus.routeStatus[index];

          return (
            <div key={index + "-" + route.type}>
              <li className="mb-7 ms-6">
                <span
                  className={cn(
                    " absolute -start-3 flex  h-6 w-6 items-center justify-center rounded-full bg-blue-950 ring-4  ring-white  dark:ring-gray-900",
                    routeStatus?.status === "success" && " bg-green-800",
                  )}
                >
                  {renderSVG(
                    routeStatus?.status ||
                      stepStatus.squidTransactionStatus ||
                      "",
                  )}
                </span>
                <h3 className="font-small text-sm capitalize leading-tight">
                  {getContent(route)}
                </h3>
              </li>
            </div>
          );
        })}
      </ol>
    );
  }
}

function SuccessSVG() {
  return (
    <svg
      className="text-wite h-3.5 w-3.5"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 12"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1 5.917 5.724 10.5 15 1.5"
      />
    </svg>
  );
}
function FailedSVG() {
  return (
    <svg
      className="h-3.5 w-3.5 text-white "
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 15L1 1M1 15L15 1"
      />
    </svg>
  );
}
function OnGoingSVG() {
  return (
    <svg
      className="h-3.5 w-3.5 text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 12h10M3 8h10M3 4h10"
      />
    </svg>
  );
}

function AmountEstimate({
  amount,
  estimate,
}: {
  amount: string;
  estimate: string;
}) {
  return (
    <div className="flex flex-col items-end">
      <div className="text-md font-bold">{amount}</div>
      <div className="text-xs opacity-60">Estimate ${estimate}</div>
    </div>
  );
}
function SkipEstimate({ tx }: { tx: SimulationEntryObject }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ amount: string; estimate: string } | null>(
    null,
  );
  useEffect(() => {
    //ignore promises must be awaited
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      setLoading(true);
      const squidSimulation = SquidStepSimulation.safeParse(
        tx.step_simulations[1],
      );
      if (!squidSimulation.success) {
        setLoading(false);
        return;
      }
      const simulation = squidSimulation.data;
      const intent = tx.transaction.intent;
      const toChain = intent.destination_chain_id;
      const price = await getTokenPrice(toChain, intent.destination_asset);

      const amount = new BigNumber(simulation.estimate.toAmount);
      const decimals = Math.min(simulation.params.toToken.decimals, 8);
      const toAmount = amount.dividedBy(10 ** decimals);
      const estimate = toAmount.times(price).toFixed(2);
      setData({ amount: toAmount.toString(), estimate });
      setLoading(false);
    })();
  }, [
    tx.transaction.intent.destination_asset,
    tx.step_simulations,
    tx.transaction.intent,
  ]);

  return (
    <AmountEstimate
      amount={loading ? "0" : data?.amount ?? ""}
      estimate={loading ? "0" : data?.estimate ?? ""}
    />
  );
}

function PendingAmount({ tx }: { tx: SimulationEntryObject }) {
  const stepSimulations = tx.step_simulations;
  const nulled = NullStepSimulation.safeParse(stepSimulations);
  if (nulled.success) {
    return null;
  }
  const onlySquid = OnlySquidStepSimulation.safeParse(stepSimulations);
  if (onlySquid.success) {
    const squidSimulation = onlySquid.data[1];

    const amount = new BigNumber(squidSimulation.estimate.toAmount);
    const decimals = Math.min(squidSimulation.params.toToken.decimals, 8);
    const toAmount = amount.dividedBy(10 ** decimals);

    return (
      <AmountEstimate
        amount={toAmount.toString()}
        estimate={squidSimulation.estimate.toAmountUSD}
      />
    );
  }
  const fullSimulation = StepSimulations.safeParse(stepSimulations);
  if (fullSimulation.success) {
    return <SkipEstimate tx={tx} />;
  }
  return null;
}

function Status({ status }: { status: string }) {
  const getStatus = () => {
    if (!status) return null;
    if (status.includes("InProgress")) {
      return "In Progress";
    } else return status;
  };

  return (
    <div
      className={cn(
        " capitalize ",
        getStatus() === "In Progress" ? "text-yellow-500" : "text-green-500",
      )}
    >
      {getStatus()}
    </div>
  );
}
