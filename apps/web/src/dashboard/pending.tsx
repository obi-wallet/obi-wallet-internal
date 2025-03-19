import { usePendingTXs } from "@/hooks/balances";
import { usePublicKeys } from "@/hooks/use-public-keys";
import { cn, getFromChain } from "@/lib/utils";
import { TargetChain, TargetChainId } from "@/target-chain";
import { isCosmosChainId } from "@/target-chain/cosmos/chains";
import { isEip155ChainId } from "@/target-chain/eip-155/chains";
import { SolanaChainId } from "@/target-chain/solana/chains";
import { useQuery } from "@obi-wallet/headless-ui";
import { AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  EmptyObject,
  SimulationEntryObject,
  SkipStatus,
  SquidRouteFromChain,
  SquidRouteToChain,
  SquidStatus,
  SquidStepInfoSimulationAction,
  StepInfo,
  Transaction,
  TransactionIntent,
} from "./schema";

type StepAndTx = StepInfo & {
  transaction: Transaction;
};

export const PendingAssets = observer(function PendingAssets() {
  const publicKeys = usePublicKeys();

  const pendingTXs = usePendingTXs(publicKeys?.secp256k1);
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
  const asset = useAssetInfo(tx.transaction.intent)?.assetInfo;

  if (!asset) {
    return null;
  }

  return (
    <>
      <div
        className="mb-3 mt-3 flex cursor-pointer flex-row items-center justify-between rounded-lg bg-blue-950 p-5 hover:bg-gray-600"
        key={tx.transaction.deposit_address}
        onClick={() => {
          const status = tx.transaction.status;
          if (status.includes("InProgress") || status.includes("Done")) {
            onOpen(tx.transaction.deposit_address);
          }
        }}
      >
        <div className="flex flex-row items-center">
          <div className="mr-3">
            <img
              src={asset?.image ?? ""}
              alt={asset?.name}
              className="h-8 w-8"
            />
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col">
              <div className="mr-5 text-lg">{asset?.name} </div>
              <div className="mr-5 text-xs opacity-60">Pending tx</div>
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
        {tx.stepInfo.map((step, index) => {
          return (
            <PendingStepItem
              key={index}
              step={{ ...step, transaction: tx.transaction }}
            />
          );
        })}
      </ol>
      <Status status={tx.transaction.status} />
    </div>
  );
});

function PendingStepItem({ step }: { step: StepAndTx }) {
  const asset = useAssetInfo(step.transaction.intent);
  const chain = asset ? TargetChain.chainId(asset.chainId) : null;

  const renderSTEPIcon = () => {
    switch (step.status.action) {
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
      case "JupiterSwap": {
        return (
          <img
            src="https://jup.ag/svg/jupiter-logo.svg"
            alt="Jupiter Swap"
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
    switch (step.status.action) {
      case "EthDeposit": {
        const chain = getFromChain(step.status.chainId);
        return `Deposit ETH on ${chain?.label}`;
      }
      case "Squid": {
        if (Object.keys(step.status).length === 0) {
          return "Not started";
        }
        const fromChain = getFromChain(step.status.chainId);
        const chainId = step.transaction.intent.destinationChainId;
        if (chainId === "neutron-1") {
          return `Swap to USDC on ${fromChain?.label} (Squid)`;
        }
        return `Swap to ${asset?.assetInfo?.name} on ${chain?.label} (Squid)`;
      }
      case "Skip": {
        return `Swap to ${asset?.assetInfo?.name} on ${chain?.label} (Skip)`;
      }
      case "JupiterSwap": {
        return `Swap to ${asset?.assetInfo?.name} on ${chain?.label} (Jupiter Swap)`;
      }
      default:
        return `Not implemented`;
    }
  };
  return (
    <li className="mb-10 ms-6">
      <span
        className={cn(
          "absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900",
          "bg-blue-950",
        )}
      >
        {renderSTEPIcon()}
      </span>
      <h3 className="font-medium leading-tight">{getStepTitle()}</h3>
      <StepDetailsList step={step} />
    </li>
  );
}

function StepDetailsList({ step }: { step: StepAndTx }) {
  if (!step.status.action || step.status.action === "EthDeposit") return null;

  const renderStatus = () => {
    switch (step.status.action) {
      case "Squid": {
        const isEmpty = EmptyObject.safeParse(step.status);
        if (isEmpty.success) {
          return <div className="text-base">Not started</div>;
        }

        const squidStatus = SquidStatus.safeParse(step.status.status);
        if (squidStatus.success) {
          return (
            <>
              <div className="text-base uppercase">
                {squidStatus.data.squidTransactionStatus}
              </div>
              <div className="text-ellipsis text-sm">
                TX hash:{" "}
                <a
                  href={squidStatus.data.axelarTransactionUrl}
                  target="_blank"
                  className="font-semibold hover:underline"
                  rel="noreferrer"
                >
                  {step.status.txHash}
                </a>
              </div>
            </>
          );
        } else {
          console.log("Error parsing squid status (renderStatus)");
          console.log(step);
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
      <StepDetailsItem step={step} />
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

  return <div className="text-base"> {getSkipStatus()}</div>;
}

function StepDetailsItem({ step }: { step: StepAndTx }) {
  if (step.type === "EthDeposit") {
    return null;
  }

  if (step.type === "Skip") {
    return null;
  }

  if (step.type === "JupiterSwap") {
    // TODO: Maybe handle
    return null;
  }

  const simulationData = step.simulation;
  if (!simulationData) return null;

  const estimate = simulationData.route.estimate;

  const squidStatus = SquidStatus.safeParse(step.status.status);
  if (!squidStatus.success) {
    return null;
  }
  const stepStatus = squidStatus.data;

  const getContent = (route: SquidStepInfoSimulationAction) => {
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

  const routes = estimate.actions;

  return (
    <ol className="relative border-s border-gray-200 p-4 text-gray-500 dark:border-gray-700 dark:text-gray-400">
      {routes.map((route, index) => {
        const routeStatus = stepStatus.routeStatus[index];

        return (
          <div key={index}>
            <li className="mb-7 ms-6">
              <span
                className={cn(
                  "absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-950 ring-4 ring-white dark:ring-gray-900",
                  routeStatus?.status === "success" && "bg-green-800",
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
      <div className="text-base font-bold">{amount}</div>
      <div className="text-xs opacity-60">Estimate ${estimate}</div>
    </div>
  );
}

// TODO:
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      const step = tx.stepInfo[1];
      if (step?.type !== "Squid") {
        setLoading(false);
        return;
      }

      const simulation = step.simulation;
      if (!simulation) {
        setLoading(false);
        return;
      }

      const intent = tx.transaction.intent;
      const toChain = intent.destinationChainId;
      const targetChain = TargetChain.chainId(toChain);
      const id = targetChain.denomToCaip19AssetId(intent.destinationAsset);
      const priceInfo = id ? await targetChain.price(id) : { usdValue: "0" };
      const price = parseFloat(priceInfo.usdValue);
      const decimals = Math.min(simulation.route.estimate.toToken.decimals, 8);
      const amount = new BigNumber(simulation.route.estimate.toAmountUSD)
        .dividedBy(price)
        .decimalPlaces(decimals);
      setData({
        amount: amount.toString(),
        estimate: simulation.route.estimate.toAmountUSD,
      });
      setLoading(false);
    })();
  }, [
    tx.transaction.intent.destinationAsset,
    tx.transaction.intent,
    tx.stepInfo,
  ]);

  return (
    <AmountEstimate
      amount={loading ? "0" : (data?.amount ?? "")}
      estimate={loading ? "0" : (data?.estimate ?? "")}
    />
  );
}

function PendingAmount(_: { tx: SimulationEntryObject }) {
  // TODO:
  // const stepSimulations = tx.step_simulations;
  // const nulled = NullStepSimulation.safeParse(stepSimulations);
  // if (nulled.success) {
  //   return null;
  // }
  // const onlySquid = OnlySquidStepSimulation.safeParse(stepSimulations);
  // if (onlySquid.success) {
  //   const squidSimulation = onlySquid.data[1];
  //
  //   const amount = new BigNumber(squidSimulation.estimate.toAmount);
  //   const decimals = Math.min(squidSimulation.params.toToken.decimals, 8);
  //   const toAmount = amount.dividedBy(10 ** decimals);
  //
  //   return (
  //     <AmountEstimate
  //       amount={toAmount.toString()}
  //       estimate={squidSimulation.estimate.toAmountUSD}
  //     />
  //   );
  // }
  // const fullSimulation = StepSimulations.safeParse(stepSimulations);
  // if (fullSimulation.success) {
  //   return <SkipEstimate tx={tx} />;
  // }
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
        "capitalize",
        getStatus() === "In Progress" ? "text-yellow-500" : "text-green-500",
      )}
    >
      {getStatus()}
    </div>
  );
}

function useAssetInfo(intent: TransactionIntent) {
  const assetQuery = useQuery({
    queryKey: ["transactionIntentToAssetInfo", intent],
    queryFn: async () => {
      return await transactionIntentToAssetInfo(intent);
    },
  });
  return assetQuery.data;
}

async function transactionIntentToAssetInfo(intent: TransactionIntent) {
  const getChainId = (): TargetChainId | null => {
    const chainId = intent.destinationChainId;
    if (chainId === "solana") {
      return SolanaChainId.Mainnet;
    }

    const cosmosChainId = `cosmos:${chainId}`;
    if (isCosmosChainId(cosmosChainId)) {
      return cosmosChainId;
    }

    const eip155ChainId = `eip155:${chainId}`;
    if (isEip155ChainId(eip155ChainId)) {
      return eip155ChainId;
    }

    console.log("unknown chain id", chainId);
    return null;
  };

  const chainId = getChainId();
  if (!chainId) return null;

  return await AssetRegistry.getInstance().byDenom({
    chainId: chainId,
    denom: intent.destinationAsset,
  });
}
