"use client";

import { Box, Divider, PriceData, getPrice } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { cn } from "@/lib/utils";
import { getQueryClient } from "@sei-js/core";
import { formatEther, parseUnits } from "ethers";
import { observer } from "mobx-react-lite";
// import { PulsarSDK } from "pulsar_sdk_js";
import { useEffect, useState } from "react";
import { pubkeyToAddress } from "secretjs";

import { FromAsset, ToAsset, fromAssets, toAssets } from "./fast-travel/assets";

// const API_KEY =
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZWFtX2lkIjoiNjU5NDBmY2U1NGU2M2ViZDcwZWIyNDBlIiwia2V5X2dlbmVyYXRlZF9hdCI6MTcwNDIwMjIwMi40NzY0MzczfQ.lcCCpTEZaRL47qrpvekjVNwAopgiYmIUvooD2MZlDks";
// const pulsar = new PulsarSDK(API_KEY);
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
    <Box title="Assets" titleClassName="ml-2 text-xl" className=" rounded-md">
      <Divider className="mt-5" />

      <PendingAssets />
      <AssetBalance />
    </Box>
  );
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
    // console.log("DATA", data, publicKey?.value);

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
      <PriceComponent asset={asset} amount={amount} />
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
    // console.log("PRICE", price, fromAssetAmount);
    const amount = formatEther(parseUnits(fromAssetAmount ?? "0", "wei"));
    // console.log("AMOUNT", amount);
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
  const [balance, setBalance] = useState<
    {
      amount: number;
      denom: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const chains = [
    "SEI",
    "NEUTRON",
    // ChainKeys.OSMOSIS, ChainKeys.NEUTRON
  ];
  const prefixes = [
    "sei",
    "neutron",
    // "osmo", "neutron"
  ];
  const pubkey = usePublicKey();
  useEffect(() => {
    if (!pubkey?.value) return;
    getIt();
  }, [pubkey?.value]);
  const getBalance = async () => {
    setLoading(true);
    // get address from public key

    const addresses = prefixes.map((p) =>
      pubkeyToAddress(Buffer.from(pubkey?.value ?? "", "base64"), p),
    );

    const balances = addresses.map((address, index) => {
      return getBalances(address, chains[index] as string);
    });
    const result = await Promise.all(balances);

    setBalance(result.flat());
    setLoading(false);
  };
  const getIt = async () => {
    await getBalance();
  };
  if (loading) return <div>loading</div>;
  if (!balance.length) return <div></div>;

  return balance.map((b) => {
    return (
      <AssetItem
        asset={{ amount: b.amount as number, denom: b.denom as string }}
        key={"balance" + b.denom}
      />
    );
  });
});
function AssetItem({ asset }: { asset: { amount: number; denom: string } }) {
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
      className="mb-3 mt-3 flex flex-row items-center justify-between rounded-lg bg-gray-700 p-5 hover:bg-gray-600"
    >
      <div className="flex flex-row items-center">
        <div className="mr-3">
          <img src={assetData?.image ?? ""} alt="asset" className="h-8 w-8" />
        </div>
        <div className="flex flex-row">
          <div className="mr-5 text-lg">{assetData?.label}</div>
          {/* <div className="text-sm">0.00</div> */}
          <div className="text-xl font-bold">{amount}</div>
        </div>
      </div>
      <PriceComponent asset={assetData as ToAsset} amount={amount} />
    </div>
  );
}

function PriceComponent({
  asset,
  amount,
}: {
  asset: ToAsset | undefined;
  amount: number | undefined;
}) {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  useEffect(() => {
    getTokenPrice();
  }, [amount]);
  const getTokenPrice = async () => {
    if (!asset || !amount) {
      setPrice(0);
      return;
    }
    setLoading(true);
    // use squidRouter to get price
    const url = `https://api.0xsquid.com/v1/token-price?chainId=${asset?.chainId}&tokenAddress=${asset.denom}`;
    const res = await fetch(url);
    const json = await res.json();

    setPrice(json.price);
    setLoading(false);
  };
  if (loading) return <div>loading</div>;
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
  // console.log({ url });
  const res = await fetch(url);
  const data = await res.json();
  // console.log("DATAT", data);
  return data as TX[];
};

const getBalances = async (address: string, chain: string) => {
  // console.log("getbalance", address, chain);
  if (!address) return [];
  let balance = [];
  if (chain === "SEI") {
    // console.log({ address });
    balance = await fetchSEIBalance(address);
  }
  if (chain === "NEUTRON") {
    balance = await fetchNeutronBalance(address);
  }

  return balance;
};
async function fetchSEIBalance(walletAddress: string) {
  if (!walletAddress) return [];
  const REST_URL = "https://sei-api.polkachu.com/";
  const queryClient = await getQueryClient(REST_URL);
  const res = await queryClient.cosmos.bank.v1beta1.allBalances({
    address: walletAddress,
  });
  // console.log("SEI BALANCE", res.balances);
  return res.balances;
}

async function fetchNeutronBalance(walletAddress: string) {
  if (!walletAddress) return [];
  const REST_URL = "https://neutron-api.polkachu.com/";
  const queryClient = await getQueryClient(REST_URL);
  const res = await queryClient.cosmos.bank.v1beta1.allBalances({
    address: walletAddress,
  });
  // console.log("NEUTRON BALANCE", res.balances);
  return res.balances;
}
