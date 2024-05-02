import { toAssets } from "@/app/dashboard/fast-travel/assets";
import {
  SimulationEntry,
  SquidRouteType,
  SquidSimulationType,
  StepType,
  TokenStatusType,
} from "@/app/dashboard/page";
import { usePendingTXs } from "@/hooks/balances";
import { usePublicKey } from "@/hooks/use-public-key";
import { cn, getFromChain, getToChain } from "@/lib/utils";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useState } from "react";

export const PendingAssets = observer(function PendingAssets() {
  const publicKey = usePublicKey();
  const pendingTXs = usePendingTXs(publicKey?.value ?? "");
  const [openedAsset, setOpenedAsset] = useState<string | null>(null);

  if (!pendingTXs.data) return null;

  return (
    <>
      {pendingTXs.data.map((tx: SimulationEntry) => (
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
      ))}
    </>
  );
});

const PendingAsset = observer(function PendingAsset({
  tx,
  opened,
  onOpen,
}: {
  tx: SimulationEntry;
  opened: boolean;
  onOpen: (addr: string) => void;
}) {
  const asset =
    toAssets[
      Object.keys(toAssets).find(
        (key) =>
          toAssets[key]?.denom === tx.transaction.intent.destination_asset,
      ) ?? ""
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
        <PendingAmount
          simulation={tx.step_simulations[1] as SquidSimulationType}
        />
      </div>
      {typeof tx.step_statuses !== "string" && opened && (
        <PendingStepList
          data={tx.step_statuses}
          txStatus={tx.transaction.status}
          simulations={tx.step_simulations}
        />
      )}
    </>
  );
});

const PendingStepList = observer(function PendingStepList({
  data,
  txStatus,
  simulations,
}: {
  txStatus: string;
  data: StepType[];
  simulations: SimulationEntry["step_simulations"];
}) {
  console.log({ simulations });

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
  const getBackgroundColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-900 ";
      case "ongoing":
        return "bg-yellow-900 ";
      case "failed":
        return "bg-red-900 ";
      default:
        return " bg-blue-900";
    }
  };
  const renderSTEPIcon = (step: StepType) => {
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
        return <img src={skipIcon} alt="Skip" />;
      }
      default:
        return null;
    }
  };

  const getContent = (data: {
    fromToken: TokenStatusType;
    fromAmount: string;
    toAmount: string;
    toToken: TokenStatusType;
    type: string;
    fromChain: string;
    toChain: string;
  }) => {
    console.log("DATA", { data });
    const fromAmount = BigNumber(data.fromAmount)
      .dividedBy(10 ** data.fromToken.decimals)
      .toFixed(8);
    const toAmount = BigNumber(data.toAmount)
      .dividedBy(10 ** data.toToken.decimals)
      .toFixed(8);
    switch (data.type) {
      case "SWAP": {
        return `Swap ${fromAmount} ${data.fromToken.name} to ${toAmount} ${data.toToken.name}`;
      }
      case "Swap": {
        return `Swap ${fromAmount} ${data.fromToken.name} to ${toAmount} ${data.toToken.name}`;
      }
      case "Transfer": {
        return `Transfer ${data.fromToken.name} from ${data.fromChain} to ${data.toChain}`;
      }
      default: {
        return `not implemented ${data.type}`;
      }
    }
  };
  const getStepDetails = (step: StepType) => {
    switch (step.action) {
      case "EthDeposit": {
        return <div className=" text-md"> Deposited</div>;
      }
      case "Squid": {
        if (
          typeof step.status === "string" ||
          Object.keys(step.status).length === 0
        )
          return;

        if (!step.status.routeStatus) {
          return <div className=" text-md">Not started</div>;
        }
        const squidSimulation = simulations[1] as SquidSimulationType;
        const routes: SquidRouteType[] = [
          ...squidSimulation.estimate.route.fromChain,
          ...squidSimulation.estimate.route.toChain,
        ];

        const stepStatus = step.status;

        return (
          <>
            <ol className="relative border-s border-gray-200 p-4 text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {routes.map((route) => {
                return (
                  <>
                    <li className="mb-7 ms-6">
                      <span
                        className={cn(
                          "bg-green absolute -start-3  flex h-6 w-6 items-center justify-center rounded-full ring-4  ring-white  dark:ring-gray-900",
                          getBackgroundColor(
                            route.status ||
                              stepStatus.squidTransactionStatus ||
                              "",
                          ),
                        )}
                      >
                        {renderSVG(
                          route.status ||
                            stepStatus.squidTransactionStatus ||
                            "",
                        )}
                      </span>
                      <h3 className="font-small text-sm capitalize leading-tight">
                        {getContent({
                          fromToken: route.fromToken,
                          fromAmount: route.fromAmount,
                          toAmount: route.toAmount,
                          toToken: route.toToken,
                          type: route.type,
                          fromChain: route.fromToken.chainId,
                          toChain: route.toToken.chainId,
                        })}
                      </h3>
                    </li>
                  </>
                );
              })}
            </ol>
            <div className=" text-md">{step.status.squidTransactionStatus}</div>
            <div className="text-ellipsis  text-sm">
              TX hash:{" "}
              <a
                href={step.status.axelarTransactionUrl}
                target="_blank"
                className="font-semibold hover:underline "
                rel="noreferrer"
              >
                {step.txHash}
              </a>
            </div>
          </>
        );
      }
      case "Skip": {
        if (Object.keys(step.status).length === 0 || step.status === "{}") {
          return <div className=" text-md">Not started</div>;
        }
        if (
          typeof step.status !== "string" &&
          step.status.status === "STATE_COMPLETED"
        ) {
          return <div className="text-md">Completed</div>;
        }
        break;
      }
      default:
        return null;
    }
  };
  const getStepTitle = (step: StepType) => {
    console.log("STEP", step);
    switch (step.action) {
      case "EthDeposit": {
        const chain = getFromChain(step.chainId);

        return `${step.action} ${chain?.label}`;
      }
      case "Squid": {
        if (step.status === "" || Object.keys(step.status).length === 0) {
          return "Not started";
        }
        const fromChain = getFromChain(step.chainId);
        const toChain = getToChain(step.toChain);

        return `Squid from ${fromChain?.label} to ${toChain?.name}`;
      }
      case "Skip": {
        const chain = getToChain(step.chainId);
        return `Skip  (${chain?.name})`;
      }
      default:
        return `${step.action} ?`;
    }
  };
  const renderStep = (step: StepType) => {
    if (step.status === "" || Object.keys(step.status).length === 0)
      return null;
    const stepStatus =
      typeof step.status === "string" ? step.status : step.status.status;
    return (
      <li className="mb-10 ms-6">
        <span
          className={cn(
            "0 bg-green absolute -start-4 flex h-8 w-8 items-center justify-center rounded-full ring-4  ring-white  dark:ring-gray-900",
            getBackgroundColor(stepStatus ?? ""),
          )}
        >
          {renderSTEPIcon(step)}
        </span>
        <h3 className="font-medium  leading-tight">{getStepTitle(step)}</h3>
        {getStepDetails(step)}
      </li>
    );
  };
  const renderItems = () => {
    if (!data ?? data.length === 0) return null;
    return data.map((step) => renderStep(step));
  };
  if (!data || data.length === 0) return null;
  return (
    <div className="flex: flex-1 p-4 pt-1">
      <ol className="relative border-s border-gray-200 p-4 text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {renderItems()}
      </ol>
      <Status status={txStatus} />
    </div>
  );
});

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

function PendingAmount({
  simulation,
  // asset,
}: {
  simulation: null | SquidSimulationType;
  // asset: ToAsset;
}) {
  if (!simulation) return null;
  const amount = new BigNumber(simulation.estimate.toAmount);
  const decimals = Math.min(simulation.params.toToken.decimals, 8);
  const toAmount = amount.dividedBy(10 ** decimals);
  return (
    <div className="flex flex-col items-end">
      <div className="text-md font-bold">{toAmount.toFixed(decimals)}</div>
      <div className="text-xs opacity-60">
        Estimate ${simulation.estimate.toAmountUSD}
      </div>
    </div>
  );
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

const skipIcon =
  "data:image/png;base64,AAABAAMAMDAAAAEAIACoJQAANgAAACAgAAABACAAqBAAAN4lAAAQEAAAAQAgAGgEAACGNgAAKAAAADAAAABgAAAAAQAgAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8P////O////3X///+r////1P///+7////8///////////////8////7////9X///+t////eP///z7///8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8D////K////3j////B////7P////3//////////////////////////////////////////////////////////f///+7////E////fP///y7///8EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Av///zH///+W////5f////7//////////////////////////////////////////////////////////////////////////////////////////////+f///+a////Nf///wMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8Y////gf///+X/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////6P///4f///8bAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Af///z7////D/////f////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7////I////RP///wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8E////Yv///+X/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////6f///2n///8GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wb///92////8v////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////X///99////CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////BP///3X////2///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4////ff///wYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Yf////L////////////////////////////////////////////////////////////////////////////////6+vr/9fX1//X19f/6+vr/////////////////////////////////////////////////////////////////////////////////////9f///2n///8BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///89////5P////////////////////////////////////////////////////////////////b29v/Nzc3/lJSU/2dnZ/9OTk7/RERE/0RERP9NTU3/ZmZm/5KSkv/Ly8v/9fX1/////////////////////////////////////////////////////////////////////+j///9EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///xf////A///////////////////////////////////////////////////////////y8vL/p6en/01NTf8zMzP/U1NT/4KCgv+kpKT/tLS0/7S0tP+kpKT/goKC/1NTU/8yMjL/SkpK/6Ojo//x8fH////////////////////////////////////////////////////////////////H////GwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///37////+/////////////////////////////////////////////////v7+/8bGxv9NTU3/Ojo6/5KSkv/e3t7/7u7u/9jY2P+8vLz/q6ur/6urq/+8vLz/2NjY/+7u7v/e3t7/kpKS/zk5Of9JSUn/w8PD//7+/v//////////////////////////////////////////////////////////h////wIAAAAAAAAAAAAAAAAAAAAA////L////+L////////////////////////////////////////////////7+/v/m5ub/y4uLv9/f3//6Ojo/9vb2/+Ghob/PT09/xYWFv8HBwf/AgIC/wICAv8HBwf/FhYW/z09Pf+Ghob/29vb/+jo6P9/f3//LCws/5eXl//6+vr//v7+//39/f/9/f3/////////////////////////////////////5////zUAAAAAAAAAAAAAAAD///8B////kf////////////////////////////////////////////////v7+/+Li4v/MDAw/7W1tf/u7u7/iIiI/x8fH/8BAQH/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/Hx8f/4eHh//u7u7/tLS0/zAwMP9QUFD/W1tb/1hYWP9aWlr/Z2dn/46Ojv/Q0ND//Pz8/////////////////////5r///8DAAAAAAAAAAD///8o////4f///////////////////////////////////////////////5ubm/8wMDD/xMTE/93d3f9NTU3/AwMD/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wMDA/9NTU3/3d3d/8XFxf8jIyP/AwMD/xMTE/8hISH/LS0t/zMzM/8uLi7/goKC//X19f///////////////+b///8uAAAAAAAAAAD///9y////////////////////////////////////////////////xsbG/y4uLv+zs7P/3Nzc/zw8PP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/PDw8/9zc3P+1tbX/FBQU/wAAAP8CAgL/BgYG/yIiIv90dHT/Nzc3/4yMjP////////////////////98AAAAAP///w3///+7///////////////////////////////////////////z8/P/T09P/35+fv/s7Oz/Tk5O/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/01NTf/r6+v/gYGB/wEBAf8AAAD/AAAA/wAAAP9OTk7/rKys/zc3N//l5eX////////////////D////Ef///zb////p//////////////////////////////////////////+oqKj/PDw8/+bm5v+IiIj/AgIC/wAAAP8AAAD/AAAA/wAAAP8AAAD/AwMD/xAQEP8gICD/Jycn/yIiIv8QEBD/AQEB/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wICAv+IiIj/5ubm/zMzM/8AAAD/AAAA/wAAAP9GRkb/4uLi/zk5Of/CwsL////////////////t////Pv///23////8//////////////////////////////////////f39/9QUFD/kZGR/9ra2v8hISH/AAAA/wAAAP8AAAD/CgoK/zMzM/9vb2//pqam/8zMzP/h4eH/6Ojo/+Pj4//Kysr/f39//xISEv8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8hISH/2tra/5SUlP8BAQH/AAAA/wAAAP+JiYn/7+/v/zs7O//AwMD////////////////+////eP///6L//////////////////////////////////////////87Ozv81NTX/3Nzc/4iIiP8AAAD/AAAA/xgYGP9iYmL/t7e3/+3t7f/+/v7//////////////////////////////////f39/19fX/8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/iIiI/97e3v8fHx//AAAA/z09Pf/o6Oj/zMzM/zU1Nf/e3t7/////////////////////rf///8v//////////////////////////////////////////5iYmP9SUlL/wMDA/yoqKv8UFBT/bm5u/9DQ0P/7+/v////////////5+fn/3t7e/7m5uf+ZmZn/ioqK/5WVlf/Gxsb/3Nzc/0JCQv8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/Pz8//8/Pz/8qKir/Kioq/8zMzP//////cnJy/2JiYv/8/Pz/////////////////////1f///+b//////////////////////////////////////////2xsbP8kJCT/ICAg/1BQUP/Hx8f//Pz8///////9/f3/3t7e/5iYmP9PT0//Hx8f/wgICP8AAAD/AAAA/wAAAP8RERH/ICAg/wMDA/8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/DQ0N/yYmJv87Ozv/zMzM//////+6urr/Ly8v/8nJyf//////////////////////////7v////b/////////////////////////////////////8fHx/0BAQP8WFhb/kpKS//Pz8////////f39/9PT0/90dHT/IiIi/wICAv8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/CAgI/19fX//g4OD//////9TU1P83Nzf/jo6O/////////////////////////////////P////3////////////////////////////////y8vL/cHBw/zk5Of/BwcH////////////d3d3/eHh4/xwcHP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wEBAf8tLS3/oqKi//b29v//////0tLS/z4+Pv9zc3P/9/f3//////////////////////////////////////3///////////////////////////b29v9vb2//QUFB/9bW1v//////9PT0/5ycnP8pKSn/AQEB/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/ICAg/39/f//h4eH///////7+/v+9vb3/NjY2/3V1df/09PT///////////////////////////////////////////X//////////////////////v7+/4uLi/85OTn/19fX///////d3d3/Wlpa/wYGBv8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AwMD/ycnJ/96enr/19fX//7+/v//////8fHx/42Njf8TExP/QUFB//Ly8v///////////////////////////////////////////P///+X/////////////////////x8fH/y8vL/+9vb3//////8jIyP83Nzf/KSkp/w8PD/8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/BAQE/yQkJP8VFRX/AAAA/wAAAP8BAQH/CgoK/yMjI/9WVlb/n5+f/+Li4v/+/v7///////v7+//CwsL/SkpK/yMjI/8nJyf/bGxs////////////////////////////////////////////////7v///8r////////////////8/Pz/YWFh/3R0dP//////yMjI/ycnJ/8rKyv/0tLS/0JCQv8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/Q0ND/+Dg4P/Nzc3/nZ2d/5KSkv+hoaH/v7+//+Li4v/6+vr////////////6+vr/y8vL/2hoaP8RERH/LS0t/8XFxf9RUVH/mJiY////////////////////////////////////////////////0////6D////////////////e3t7/NTU1/83Nzf/n5+f/Ojo6/wAAAP8eHh7/3d3d/4yMjP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/XFxc//z8/P/////////////////////////////////+/v7/6enp/7Gxsf9cXFz/FRUV/wAAAP8AAAD/i4uL/9vb2/80NDT/z8/P////////////////////////////////////////////////q////2v////7///////////BwcH/Ozs7/+7u7v+IiIj/AAAA/wAAAP8AAAD/kZGR/93d3f8kJCT/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/EBAQ/3d3d//Dw8P/3t7e/+Tk5P/c3Nz/xsbG/5+fn/9oaGj/Li4u/wgICP8AAAD/AAAA/wAAAP8jIyP/3Nzc/46Ojv9RUVH/+Pj4///////////////////////////////////////////9////df///zT////n///////////FxcX/OTk5/+Dg4P9GRkb/AAAA/wAAAP8AAAD/MTEx/+Xl5f+NjY3/AwMD/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wEBAf8MDAz/HR0d/yIiIv8bGxv/DQ0N/wICAv8AAAD/AAAA/wAAAP8AAAD/AAAA/wMDA/+NjY3/5OTk/zo6Ov+rq6v////////////////////////////////////////////////s////PP///wv///+5///////////o6Oj/Ojo6/6ioqP9RUVH/AAAA/wAAAP8AAAD/AQEB/319ff/t7e3/U1NT/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/1NTU//t7e3/enp6/1FRUf/09PT////////////////////////////////////////////////A////EAAAAAD///9v////////////////lJSU/zU1Nf9zc3P/JSUl/wgICP8DAwP/AAAA/xISEv+xsbH/39/f/0FBQf8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/QUFB/9/f3/+vr6//Li4u/8nJyf////////////////////////////////////////////////////94AAAAAAAAAAD///8l////3///////////9/f3/4yMjP8xMTH/MjIy/ywsLP8hISH/ExMT/wMDA/8hISH/wMDA/+Hh4f9TU1P/BAQE/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wQEBP9TU1P/4ODg/8DAwP8uLi7/n5+f/////////////////////////////////////////////////////+T///8sAAAAAAAAAAD///8B////jP////////////////39/f/X19f/mJiY/3BwcP9iYmL/aGho/39/f/9vb2//MDAw/6+vr//w8PD/j4+P/yQkJP8BAQH/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8BAQH/JCQk/4+Pj//w8PD/r6+v/y4uLv+QkJD//Pz8/////////////////////////////////////////////////////5X///8CAAAAAAAAAAAAAAAA////K////9/////////////////////////////////////////////////7+/v/oKCg/y8vL/95eXn/5ubm/9/f3/+Ojo7/Q0ND/xoaGv8JCQn/BAQE/wQEBP8JCQn/Ghoa/0NDQ/+Ojo7/39/f/+Xl5f95eXn/Li4u/6CgoP/7+/v/////////////////////////////////////////////////////5P///zIAAAAAAAAAAAAAAAAAAAAAAAAAAP///3j////9/////////////////////////////////////////////////////8vLy/9TU1P/ODg4/4yMjP/a2tr/7+/v/93d3f/Dw8P/s7Oz/7Ozs//Dw8P/3d3d/+/v7//a2tr/jIyM/zc3N/9SUlL/ysrK////////////////////////////////////////////////////////////////gf///wEAAAAAAAAAAAAAAAAAAAAAAAAAAP///xT///+7///////////////////////////////////////////////////////////09PT/r6+v/1RUVP80NDT/T09P/3x8fP+dnZ3/rq6u/66urv+dnZ3/e3t7/09PT/8zMzP/UlJS/62trf/09PT////////////////////////////////////////////////////////////////C////GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///84////4P////////////////////////////////////////////////////////////////n5+f/T09P/nZ2d/29vb/9UVFT/SUlJ/0lJSf9UVFT/bm5u/5ubm//S0tL/+Pj4/////////////////////////////////////////////////////////////////////+X///8/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////W////+/////////////////////////////////////////////////////////////////////////////////8/Pz/+Pj4//j4+P/8/Pz/////////////////////////////////////////////////////////////////////////////////////8v///2IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////A////27////z///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////2////dv///wQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wX///9u////8P////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////L///91////BgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8D////Wv///+H/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////5P///2H///8EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///zj///+8/////P////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////3////B////Pf///wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8U////eP///+D/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4////37///8WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////Af///yr///+N////4P////7//////////////////////////////////////////////////////////////////////////////////////////v///+L///+R////Lv///wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8C////Jf///2////+5////6P////z//////////////////////////////////////////////////////////P///+n///+8////cv///yf///8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8L////M////2v///+g////yv///+b////1/////f////3////2////5v///8v///+j////bf///zX///8MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//4Af//wAA//8AAP//AAD/+AAAH/8AAP/gAAAH/wAA/8AAAAP/AAD/gAAAAf8AAP8AAAAA/wAA/gAAAAB/AAD8AAAAAD8AAPgAAAAAHwAA8AAAAAAPAADwAAAAAAcAAOAAAAAABwAAwAAAAAADAADAAAAAAAMAAMAAAAAAAwAAgAAAAAABAACAAAAAAAEAAIAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAEAAIAAAAAAAQAAgAAAAAABAADAAAAAAAMAAMAAAAAAAwAAwAAAAAADAADgAAAAAAcAAPAAAAAABwAA8AAAAAAPAAD4AAAAAB8AAPwAAAAAPwAA/gAAAAB/AAD/AAAAAP8AAP+AAAAB/wAA/8AAAAP/AAD/8AAAD/8AAP/4AAAf/wAA//8AAP//AAD//+AH//8AACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8E////LP///3H///+y////3v////b///////////////f////f////s////3P///8u////BQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8E////Of///5v////h/////P///////////////////////////////////////////////P///+P///+d////PP///wQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////G////43////s///////////////////////////////////////////////////////////////////////////////t////kP///x4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///zj////F/////v//////////////////////////////////////////////////////////////////////////////////////////////yP///zsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///9E////2///////////////////////////////////////////////////////////////////////////////////////////////////////////////3v///0gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////N////9r///////////////////////////////////////////7+/v/29vb/7e3t/+3t7f/29vb//v7+////////////////////////////////////////////////3v///zwAAAAAAAAAAAAAAAAAAAAAAAAAAP///xv////D//////////////////////////////////////Dw8P+3t7f/goKC/3BwcP9ubm7/bm5u/29vb/+AgID/tbW1/+/v7///////////////////////////////////////////yP///x4AAAAAAAAAAAAAAAD///8C////iv////////////////////////////////z8/P+6urr/ampq/4SEhP+wsLD/tra2/66urv+urq7/tra2/7CwsP+Dg4P/aGho/7i4uP/8/Pz/////////////////////////////////////kP///wQAAAAAAAAAAP///zj////p///////////////////////////4+Pj/lJSU/3Fxcf+8vLz/kJCQ/0BAQP8XFxf/CgoK/woKCv8XFxf/QEBA/4+Pj/+7u7v/cHBw/42Njf/Q0ND/zc3N/9LS0v/q6ur//v7+///////////s////PQAAAAD///8C////l////////////////////////////f39/5SUlP9/f3//ubm5/z4+Pv8CAgL/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AgIC/z4+Pv+5ubn/enp6/xgYGP8hISH/MTEx/09PT/+VlZX/9fX1//////////+d////BP///yr////e//////////////////////////+6urr/cnJy/7m5uf8nJyf/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/yYmJv+6urr/Xl5e/wAAAP8FBQX/Kysr/2BgYP+enp7//////////+L///8u////bP////v/////////////////////8fHx/2tra/+7u7v/Pz8//wAAAP8AAAD/AAAA/wYGBv8XFxf/IyMj/x4eHv8ICAj/AAAA/wAAAP8AAAD/AAAA/z8/P/+/v7//IyMj/wAAAP8ODg7/oKCg/3BwcP/39/f//////P///3P///+s//////////////////////////+4uLj/hYWF/5CQkP8BAQH/BgYG/zIyMv94eHj/tbW1/9ra2v/p6en/4+Pj/66urv8iIiL/AAAA/wAAAP8AAAD/AQEB/5CQkP96enr/AAAA/zk5Of/Kysr/bm5u//b29v//////////s////9j//////////////////////////4SEhP+UlJT/Ojo6/z4+Pv+np6f/7u7u//7+/v/o6Oj/xcXF/6+vr/+9vb3/2NjY/zk5Of8AAAD/AAAA/wAAAP8AAAD/QEBA/5OTk/8hISH/vb29/6mpqf+Kior////////////////f////8f/////////////////////4+Pj/UFBQ/zo6Ov+Xl5f/8vLy//X19f+0tLT/YGBg/yYmJv8LCwv/AwMD/wkJCf8bGxv/BAQE/wAAAP8AAAD/AAAA/wAAAP8JCQn/RERE/7y8vP/d3d3/Y2Nj/9vb2/////////////////f////8/////////////////v7+/6ysrP9YWFj/zs7O//n5+f+xsbH/RUVF/wkJCf8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/DAwM/2BgYP/b29v/4+Pj/2lpaf+1tbX///////////////////////////z///////////////+zs7P/ampq/+Xl5f/Y2Nj/XFxc/wsLC/8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/CgoK/0lJSf+1tbX/+fn5/8vLy/9WVlb/rq6u////////////////////////////////8f//////////2tra/2RkZP/e3t7/ubm5/0NDQ/8KCgr/AAAA/wAAAP8AAAD/AAAA/wUFBf8dHR3/CwsL/wQEBP8NDQ3/KSkp/2RkZP+4uLj/9vb2//Dw8P+UlJT/Ozs7/1FRUf/4+Pj///////////////////////////b////X//////////+Kior/q6ur/7u7u/8fHx//lJSU/0NDQ/8AAAD/AAAA/wAAAP8AAAD/Ojo6/9vb2//BwcH/tLS0/8nJyf/r6+v//v7+/+zs7P+jo6P/Ozs7/zs7O/+VlZX/hISE////////////////////////////////3v///6r/////9vb2/29vb//Kysr/ODg4/wAAAP94eHj/k5OT/wICAv8AAAD/AAAA/wAAAP8gICD/qamp/+Dg4P/m5ub/19fX/7Gxsf9zc3P/Li4u/wUFBf8BAQH/kpKS/4ODg/+4uLj///////////////////////////////+x////av////v4+Pj/cXFx/5+fn/8ODg7/AAAA/yEhIf+/v7//QkJC/wAAAP8AAAD/AAAA/wAAAP8HBwf/Gxsb/yAgIP8VFRX/BQUF/wAAAP8AAAD/AAAA/0JCQv+7u7v/a2tr//Hx8f///////////////////////////P///3H///8o////3f////+jo6P/X19f/ywsLP8GBgb/AAAA/1tbW/+8vLz/KSkp/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8pKSn/urq6/3BwcP+7u7v////////////////////////////////g////Lf///wL///+U//////f39/+bm5v/UlJS/zMzM/8mJib/JSUl/3t7e/+7u7v/QkJC/wMDA/8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8DAwP/QkJC/7u7u/99fX3/lpaW//39/f///////////////////////////////5r///8DAAAAAP///zX////o//////7+/v/t7e3/19fX/9TU1P/g4OD/lZWV/3BwcP+7u7v/lJSU/0RERP8aGhr/DAwM/wwMDP8aGhr/RERE/5SUlP+7u7v/b29v/5aWlv/5+fn////////////////////////////////r////OgAAAAAAAAAA////Av///4f////////////////////////////////9/f3/vr6+/21tbf+CgoL/rq6u/7e3t/+wsLD/sLCw/7e3t/+urq7/goKC/2xsbP+9vb3//f39/////////////////////////////////////43///8DAAAAAAAAAAAAAAAA////Gf///8D/////////////////////////////////////8vLy/7u7u/+Ghob/cnJy/29vb/9vb2//cXFx/4WFhf+6urr/8vLy///////////////////////////////////////////E////HAAAAAAAAAAAAAAAAAAAAAAAAAAA////NP///9f////////////////////////////////////////////////4+Pj/8PDw//Dw8P/4+Pj/////////////////////////////////////////////////////2////zgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////P////9j//////////////////////////////////////////////////////////////////////////////////////////////////////////////9v///9EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////NP///8D////+//////////////////////////////////////////////////////////////////////////////////////////7////E////NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////GP///4f////p///////////////////////////////////////////////////////////////////////////////q////i////xsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////A////zX///+V////3v////v///////////////////////////////////////////////v////f////l////zf///8DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wP///8n////av///6r////Y////8f////3////9////8v///9n///+s////bP///yn///8EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AP//+AAf/+AAB//AAAP/gAAB/wAAAP4AAAB8AAAAPAAAADgAAAAYAAAAGAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABgAAAAYAAAAHAAAADwAAAA+AAAAfwAAAP+AAAH/wAAD/+AAB//4AB///wD/8oAAAAEAAAACAAAAABACAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////B////0r///+q////5v////3////9////5v///6v///9M////CAAAAAAAAAAAAAAAAAAAAAAAAAAA////Gf///5T////v////////////////////////////////////8P///5b///8aAAAAAAAAAAAAAAAA////Gf///7L////////////////4+Pj/7Ozs/+zs7P/4+Pj/////////////////////tP///xoAAAAA////Bv///5P///////////j4+P/Jycn/oqKi/46Ojv+Ojo7/oaGh/8jIyP/4+Pj///////////////+V////B////0n////t//////n5+f+zs7P/enp6/zg4OP8WFhb/FhYW/zg4OP97e3v/iIiI/319ff+ysrL/9vb27////0z///+n///////////Kysr/eXl5/xQUFP8JCQn/Hx8f/xcXF/8AAAD/FxcX/2pqav8UFBT/SkpK/8nJyf////+q////4//////4+Pj/lZWV/1RUVP9ycnL/qqqq/7CwsP+goKD/HR0d/wAAAP84ODj/UFBQ/4SEhP/FxcX/////5v////v/////2NjY/4WFhf+xsbH/fn5+/zMzM/8SEhL/FhYW/wUFBf8AAAD/MTEx/6Kiov+pqan/7e3t//////z////77Ozs/6mpqf+hoaH/MDAw/wAAAP8GBgb/FxcX/xMTE/81NTX/gICA/7Gxsf+FhYX/2dnZ///////////8////4sXFxf+Dg4P/T09P/zk5Of8AAAD/HR0d/6CgoP+wsLD/qamp/3BwcP9TU1P/lZWV//j4+P//////////5f///6bKysr/SkpK/xQUFP9ra2v/GBgY/wAAAP8WFhb/HR0d/wgICP8UFBT/enp6/8rKyv///////////////6n///9I9/f37bW1tf+CgoL/j4+P/319ff86Ojr/FxcX/xcXF/85OTn/e3t7/7S0tP/5+fn//////////+7///9L////Bf///5H///////////n5+f/Ly8v/o6Oj/5CQkP+QkJD/o6Oj/8rKyv/5+fn///////////////+T////BgAAAAD///8Y////sP////////////////n5+f/t7e3/7e3t//j4+P////////////////////+y////GQAAAAAAAAAAAAAAAP///xj///+R////7v///////////////////////////////////+////+T////GQAAAAAAAAAAAAAAAAAAAAAAAAAA////Bv///0f///+m////4/////v////7////5P///6f///9J////BwAAAAAAAAAAAAAAAPgfAADgBwAAwAMAAIABAACAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAEAAIABAADAAwAA4AcAAPgfAAA=";
