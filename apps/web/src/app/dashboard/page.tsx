"use client";

import { Box, Divider, getPrice, PriceData, Text } from "@/components";
import { Coin, useBalances, useUSDTotalPrice } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { cn } from "@/lib/utils";
import { TargetChain } from "@/target-chain";
import { formatEther, parseUnits } from "ethers";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FromAsset, fromAssets, ToAsset, toAssets } from "./fast-travel/assets";
import { FaExclamation } from "react-icons/fa6";

export interface TransactionStatus {
  axelarTransactionUrl: string;
  error: object;
  fromChain: ChainData;
  gasStatus: string;
  id: string;
  isGMPTransaction: boolean;
  routeStatus: RouteStatus[];
  squidTransactionStatus: string;
  status: string;
  timeSpent: TimeSpent;
  toChain: ChainData;
}

export interface ChainData {
  blockNumber: number;
  callEventLog: object[];
  callEventStatus: string;
  chainData: ChainDetails;
  transactionId: string;
  transactionUrl: string;
}

export interface ChainDetails {
  axelarContracts: AxelarContracts;
  blockExplorerUrls: string[];
  chainIconURI: string;
  chainId: number | string;
  chainName: string;
  chainNativeContracts: ChainNativeContracts;
  chainType: string;
  compliance: Compliance;
  estimatedExpressRouteDuration: number;
  estimatedRouteDuration: number;
  nativeCurrency: Currency;
  networkName: string;
  rpc: string;
  squidContracts: SquidContracts;
  swapAmountForGas: string;
}

export interface AxelarContracts {
  forecallable?: string;
  gateway: string;
}

export interface ChainNativeContracts {
  ensRegistry?: string;
  multicall?: string;
  usdcToken?: string;
  wrappedNativeToken?: string;
}

export interface Compliance {
  trmIdentifier: string;
}

export interface Currency {
  decimals: number;
  icon: string;
  name: string;
  symbol: string;
}

export interface SquidContracts {
  defaultCrosschainToken?: string;
  squidFeeCollector?: string;
  squidMulticall?: string;
  squidRouter?: string;
}

export interface RouteStatus {
  action: string;
  chainId: number | string;
  status: string;
  txHash: string;
}

export interface TimeSpent {
  call_confirm: number;
  total: number;
}

export interface Transaction {
  deposit_address: string;
  id: number;
  status: string;
  steps: TransactionStep[];
  tx_hashes: string[];
}

export interface TransactionStep {
  enableForecall?: boolean;
  fromAddress?: string;
  fromAmount?: string;
  fromChain: string;
  fromToken: string;
  slippage?: string;
  stepType: string;
  toAddress?: string;
  toChain?: string;
  toToken?: string;
}

export interface TX {
  status: TransactionStatus;
  transaction: Transaction;
}

export default observer(function Dashboard() {
  useCurrentWallet({ redirectTo: "/" });

  return (
    <div className="grid h-full w-full grid-rows-3 gap-4 px-7 py-5 text-white">
      <Assets />
      {/* <Box title="Chart" /> */}
      {/* <Box title="Top Positions" /> */}
    </div>
  );
});

const Assets = observer(function Assets() {
  return (
    <Box className="ml-2 rounded-md text-xl">
      <div className="flex flex-row justify-between">
        <Text>Assets</Text>
        <Total />
      </div>

      <Divider className="mt-5" />
      {/* create an alert banner to remind users to wait if a tx has just been issued */}
      <div className="mt-3 flex  w-full flex-row rounded-md bg-slate-600 p-2">
        <FaExclamation className="ml-2 mr-3" />
        <Text size="sm" className="">
          Fast Travel transactions may take a few minutes be processed and will
          appear here once visible on the network.
        </Text>
      </div>

      <PendingAssets />
      <AssetBalance />
    </Box>
  );
});
const Total = observer(function Total() {
  const totalPrice = useUSDTotalPrice();

  if (totalPrice.loading) {
    return <Text>loading</Text>;
  }

  return <Text>$ {totalPrice.total}</Text>;
});
const PendingAssets = observer(function PendingAssets() {
  const [txData, setTxData] = useState<TX[] | null>(null);
  const publicKey = usePublicKey();

  useEffect(() => {
    if (!publicKey?.value) return;
    fetchPendingAssets();
  }, [publicKey?.value]);

  const fetchPendingAssets = async () => {
    const data = await getPendingAssets(publicKey?.value ?? "");

    setTxData(
      data.filter((t) => t.status.squidTransactionStatus === "ongoing"),
    );
  };

  if (!txData) return null;

  return txData.map((tx: TX) => {
    return <PendingAsset key={tx.transaction.deposit_address} tx={tx} />;
  });
});

const PendingAsset = observer(function PendingAsset({ tx }: { tx: TX }) {
  const [amount, setAmount] = useState<number | undefined>();
  const asset =
    toAssets[
      Object.keys(toAssets).find(
        (key) => toAssets[key]?.denom === tx.transaction.steps[1]?.toToken,
      ) ?? ""
    ];

  return (
    <div
      className="mb-3 mt-3 flex flex-row items-center justify-between rounded-lg bg-gray-700 p-5 hover:bg-gray-600"
      key={tx.transaction.deposit_address}
    >
      <div className="flex flex-row items-center">
        <div className="mr-3">
          <img src={asset?.image ?? ""} alt="asset" className="h-8 w-8" />
        </div>
        <div className="flex flex-row">
          <div className="mr-5 text-lg">{asset?.label}</div>
          <EstimateAmount tx={tx} toAsset={asset} onAmountChange={setAmount} />
        </div>
      </div>
      <StatusLink tx={tx} />
      <PriceComponent amount={amount} price={0} />
    </div>
  );
});

const EstimateAmount = observer(function EstimateAmount({
  tx,
  toAsset,
  onAmountChange,
}: {
  tx: TX;
  toAsset: ToAsset | undefined;
  onAmountChange?: (amount: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number | undefined>();
  useEffect(() => {
    getAmount();
  }, []);
  useEffect(() => {
    if (!amount) return;
    onAmountChange && onAmountChange(amount);
  }, [amount]);
  if (toAsset === undefined) return null;
  const getAmount = async () => {
    setLoading(true);
    const fromAssetAmount = tx.transaction.steps[1]?.fromAmount;
    //find from asset based on the chainId
    const fromAsset =
      fromAssets[
        Object.keys(fromAssets).find(
          (key) =>
            fromAssets[key]?.chainId === tx.transaction.steps[1]?.fromChain,
        ) ?? ""
      ];

    const priceData = (await getPrice({
      mainCoin: fromAsset as FromAsset,
      vsCoin: toAsset,
      usdPrices: true,
    })) as PriceData;
    const price = priceData.mainVsPrice;

    const amount = formatEther(parseUnits(fromAssetAmount ?? "0", "wei"));

    const amountNumber = Number(amount) * price;
    // discount 2$ for fees
    setAmount(amountNumber - 2.5 / priceData.vsUsd);

    setLoading(false);
  };
  if (!amount || loading) return null;
  return (
    <div className="text-xl font-bold">
      {amount?.toFixed(2)} <span className="text-sm">(estimate)</span>
    </div>
  );
});

function StatusLink({ tx }: { tx: TX }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "ongoing":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-white";
    }
  };
  return (
    <div>
      <a
        target="_blank"
        href={tx.status.axelarTransactionUrl}
        rel="noreferrer"
        className={cn(
          " uppercase hover:underline",
          getStatusColor(tx.status.squidTransactionStatus),
        )}
      >
        {tx.status.squidTransactionStatus}
      </a>
    </div>
  );
}

const AssetBalance = observer(function AssetBalance() {
  const publicKey = usePublicKey();
  const balances = useBalances({
    publicKey,
  });
  if (balances.every((b) => b.isLoading)) {
    return <span className="font-extrabold  text-white"> loading </span>;
  }
  const balance = balances.filter((b) => b.data && b.data.balances?.length > 0);

  if (balance.length === 0) return null;

  return balance.map((b) => {
    return b.data?.balances.map((chainBalance: Coin) => {
      return (
        <AssetItem
          asset={{
            amount: Number(chainBalance.amount),
            denom: chainBalance.denom,
            price: chainBalance.price,
            chainId: b.data.chainId,
          }}
          key={chainBalance.denom + b.data.chainId}
        />
      );
    });
  });
});
function AssetItem({
  asset,
}: {
  asset: { amount: number; denom: string; price: number; chainId: string };
}) {
  const router = useRouter();
  const assetData =
    toAssets[
      Object.keys(toAssets).find(
        (key) => toAssets[key]?.denom === asset.denom,
      ) ?? ""
    ];

  // get the amount readable using the decimal places in the assetData
  const amount = asset.amount / Math.pow(10, assetData?.decimals ?? 0);

  return (
    <div
      key={asset.denom}
      className="mb-3 mt-3 flex cursor-pointer flex-row items-center justify-between rounded-lg bg-gray-700 p-5 hover:bg-gray-600"
      onClick={() => {
        router.push(`/dashboard/transaction/send/${assetData?.label}`);
      }}
    >
      <div className="flex flex-row items-center">
        <div className="mr-3">
          <img src={assetData?.image ?? ""} alt="asset" className="h-8 w-8" />
        </div>
        <div className="flex flex-row">
          <div className="mr-5 text-lg">
            <div>{assetData?.label}</div>
            <div className=" text-xs opacity-60">
              (on {TargetChain.chainId(asset.chainId).label})
            </div>
          </div>
          <div className="flex items-center text-xl font-bold">{amount}</div>
        </div>
      </div>
      <PriceComponent amount={amount} price={asset.price} />
    </div>
  );
}

function PriceComponent({ amount, price }: { price: number; amount?: number }) {
  return (
    <div>
      <div className="text-xl">${(price * (amount || 0)).toFixed(2)}</div>
    </div>
  );
}

const getPendingAssets = async (pubKey: string) => {
  if (!pubKey) return [];

  const url = `https://fast-travel-playground.vercel.app/api/status/check.rs?test=false&pubkey=${encodeURIComponent(
    pubKey,
  )}`;

  const res = await fetch(url);
  const data = await res.json();

  return data as TX[];
};
