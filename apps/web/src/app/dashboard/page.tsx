"use client";

import { Box, Divider } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { cn } from "@/lib/utils";
import { getQueryClient } from "@sei-js/core";
import { observer } from "mobx-react-lite";
// import { PulsarSDK } from "pulsar_sdk_js";
import { useEffect, useState } from "react";
import { pubkeyToAddress } from "secretjs";

import { ToAsset, toAssets } from "./fast-travel/assets";

// const API_KEY =
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZWFtX2lkIjoiNjU5NDBmY2U1NGU2M2ViZDcwZWIyNDBlIiwia2V5X2dlbmVyYXRlZF9hdCI6MTcwNDIwMjIwMi40NzY0MzczfQ.lcCCpTEZaRL47qrpvekjVNwAopgiYmIUvooD2MZlDks";
// const pulsar = new PulsarSDK(API_KEY);
type TxData = {
  squid_status: {
    axelarTransactionUrl: string;
    error: Record<string, unknown>;
    fromChain: {
      blockNumber: number;

      callEventStatus: string;
      chainData: {
        axelarContracts: {
          forecallable: string;
          gateway: string;
        };
        blockExplorerUrls: string[];
        chainIconURI: string;
        chainId: number;
        chainName: string;
        chainNativeContracts: {
          ensRegistry: string;
          multicall: string;
          usdcToken: string;
          wrappedNativeToken: string;
        };
        chainType: string;
        compliance: {
          trmIdentifier: string;
        };
        estimatedExpressRouteDuration: number;
        estimatedRouteDuration: number;
        nativeCurrency: {
          decimals: number;
          icon: string;
          name: string;
          symbol: string;
        };
        networkName: string;
        rpc: string;
        squidContracts: {
          defaultCrosschainToken: string;
          squidFeeCollector: string;
          squidMulticall: string;
          squidRouter: string;
        };
        swapAmountForGas: string;
      };
      transactionId: string;
      transactionUrl: string;
    };
    gasStatus: string;
    id: string;
    isGMPTransaction: boolean;
    routeStatus: {
      action: string;
      chainId: number;
      status: string;
      txHash: string;
    }[];
    squidTransactionStatus: string;
    status: string;
    timeSpent: {
      total: number;
    };
    toChain: {
      blockNumber: string;

      callEventStatus: string;
      transactionId: string;
      transactionUrl: string;
    };
  };
  transaction: {
    deposit_address: string;
    id: number;
    status: string;
    steps: {
      enableForecall: boolean | null;
      fromAddress: string | null;
      fromAmount: string | null;
      fromChain: string;
      fromToken: string;
      slippage: string | null;
      stepType: string;
      toAddress: string | null;
      toChain: string | null;
      toToken: string | null;
    }[];
    tx_hashes: string[];
  }[];
};
type TX = {
  deposit_address: string;
  steps: {
    enableForecall: boolean | null;
    fromAddress: string | null;
    fromAmount: string | null;
    fromChain: string;
    fromToken: string;
    slippage: string | null;
    stepType: string;
    toAddress: string | null;
    toChain: string | null;
    toToken: string | null;
  }[];
  status: string;
};
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
  const publicKey = usePublicKey();

  return (
    <Box title="Assets" titleClassName="ml-2 text-xl" className=" rounded-md">
      <Divider className="mt-5" />

      <PendingAssets publicKey={publicKey?.value ?? ""} />
      <AssetBalance />
    </Box>
  );
});

const PendingAssets = observer(function PendingAssets({
  publicKey,
}: {
  publicKey: string;
}) {
  const [txData, setTxData] = useState<TX[] | null>(null);

  useEffect(() => {
    fetchPendingAssets();
  }, []);
  const fetchPendingAssets = async () => {
    const data = await getPendingAssets(publicKey);
    // grab relevant data from data and set it to txData
    console.log("FETCH", data);
    setTxData(data);
  };

  // get the wallet using the public key and prefixes
  if (!txData) return null;
  return txData.map((tx: TX) => {
    const asset =
      toAssets[
        Object.keys(toAssets).find(
          (key) => toAssets[key]?.denom === tx.steps[1]?.toToken,
        ) ?? ""
      ];
    console.log("AASSSEEETTT", asset, tx);
    return (
      <div
        className="mb-3 mt-3 flex flex-row items-center justify-between rounded-lg bg-gray-700 p-5 hover:bg-gray-600"
        key={tx.deposit_address}
      >
        <div className="flex flex-row items-center">
          <div className="mr-3">
            <img src={asset?.image ?? ""} alt="asset" className="h-8 w-8" />
          </div>
          <div className="flex flex-row">
            <div className="mr-5 text-lg">{asset?.label}</div>

            <div className="text-xl font-bold">0.00</div>
          </div>
        </div>
        <StatusLink address={tx.deposit_address} />
        <div>
          <div className="text-xl">${(0 * 0).toFixed(2)}</div>
        </div>
      </div>
    );
  });
});

function StatusLink({ address }: { address: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TxData | null>(null);
  useEffect(() => {
    getStatus();
  }, []);
  const getStatus = async () => {
    setLoading(true);
    const url = `https://fast-travel-playground.vercel.app/api/status/check.rs?test=false&depositAddress=${encodeURIComponent(
      address,
    )}`;
    const res = await fetch(url);
    const json = await res.json();
    setStatus(json);
    setLoading(false);
  };
  console.log("STAT", { status });
  if (loading) return <div>loading</div>;
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
      {status?.squid_status.status ? (
        <a
          target="_blank"
          href={status?.squid_status.axelarTransactionUrl}
          rel="noreferrer"
          className={cn(
            "hover:underline",
            getStatusColor(status?.squid_status.squidTransactionStatus),
          )}
        >
          {status?.squid_status.squidTransactionStatus}
        </a>
      ) : (
        "FAILED"
      )}
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
    // ChainKeys.OSMOSIS, ChainKeys.NEUTRON
  ];
  const prefixes = [
    "sei",
    // "osmo", "neutron"
  ];
  const pubkey = usePublicKey();
  useEffect(() => {
    getIt();
  }, []);
  const getBalance = async () => {
    setLoading(true);
    // get address from public key

    const addresses = prefixes.map((p) =>
      pubkeyToAddress(Buffer.from(pubkey?.value ?? "", "base64"), p),
    );

    const balances = addresses.map((address, index) => {
      return getBalanceFromPulsar(address, chains[index] as string);
    });
    const result = await Promise.all(balances);

    setBalance(result.flat());
    setLoading(false);
  };
  const getIt = async () => {
    await getBalance();
  };
  if (loading) return <div>loading</div>;
  if (!balance.length) return <div>no balance</div>;

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
          <img
            src={toAssets["sei"]?.image ?? ""}
            alt="asset"
            className="h-8 w-8"
          />
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

function PriceComponent({ asset, amount }: { asset: ToAsset; amount: number }) {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  useEffect(() => {
    getPrice();
  }, []);
  const getPrice = async () => {
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
      <div className="text-xl">${(price * amount).toFixed(2)}</div>
    </div>
  );
}

const getPendingAssets = async (pubKey: string) => {
  //https://fast-travel-playground.vercel.app/api/status/check.rs?test=false&pubkey=BOhbwGQj67ZIiUunwoqyMFte4x5iRVFZSIS0hVauQYMR2D%2Ffzq7zdWthXja8bD8Z%2BtUA8V28WqqFZt3u460pmn0%3D
  const url = `https://fast-travel-playground.vercel.app/api/status/check.rs?test=false&pubkey=${encodeURIComponent(
    pubKey,
  )}`;
  console.log({ url });
  const res = await fetch(url);
  const data = await res.json();
  return data.transactions;
};

// const txData = {
//   squid_status: {
//     axelarTransactionUrl:
//       "https://axelarscan.io/gmp/0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
//     error: {},
//     fromChain: {
//       blockNumber: 173870219,
//       callEventLog: [],
//       callEventStatus: "",
//       chainData: {
//         axelarContracts: {
//           forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
//           gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
//         },
//         blockExplorerUrls: ["https://arbiscan.io/"],
//         chainIconURI:
//           "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/arb.svg",
//         chainId: 42161,
//         chainName: "Arbitrum",
//         chainNativeContracts: {
//           ensRegistry: "",
//           multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
//           usdcToken: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
//           wrappedNativeToken: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
//         },
//         chainType: "evm",
//         compliance: {
//           trmIdentifier: "arbitrum",
//         },
//         estimatedExpressRouteDuration: 20,
//         estimatedRouteDuration: 1800,
//         nativeCurrency: {
//           decimals: 18,
//           icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/arbitrum.svg",
//           name: "Arbitrum",
//           symbol: "ETH",
//         },
//         networkName: "Arbitrum",
//         rpc: "https://arb1.arbitrum.io/rpc",
//         squidContracts: {
//           defaultCrosschainToken: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
//           squidFeeCollector: "0x19cd4F3820E7BBed45762a30BFA37dFC6c9C145b",
//           squidMulticall: "0x4fd39C9E151e50580779bd04B1f7eCc310079fd3",
//           squidRouter: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
//         },
//         swapAmountForGas: "2000000",
//       },
//       transactionId:
//         "0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
//       transactionUrl:
//         "https://arbiscan.io/tx/0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
//     },
//     gasStatus: "gas_paid",
//     id: "0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf_2_14",
//     isGMPTransaction: true,
//     routeStatus: [
//       {
//         action: "call",
//         chainId: 42161,
//         status: "success",
//         txHash:
//           "0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
//       },
//     ],
//     squidTransactionStatus: "ongoing",
//     status: "source_gateway_called",
//     timeSpent: {
//       total: 374,
//     },
//     toChain: {
//       blockNumber: "",
//       callEventLog: [],
//       callEventStatus: "",
//       transactionId: "",
//       transactionUrl: "",
//     },
//   },
//   transaction: [
//     {
//       deposit_address: "0xdb1dfde093058ad27f98d6210500d1da11ff4d73",
//       id: 21,
//       status: "AwaitingWithdrawal",
//       steps: [
//         {
//           enableForecall: null,
//           fromAddress: null,
//           fromAmount: null,
//           fromChain: "arbitrum",
//           fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//           slippage: null,
//           stepType: "EthDeposit",
//           toAddress: null,
//           toChain: null,
//           toToken: null,
//         },
//         {
//           enableForecall: false,
//           fromAddress: "0xeCbFB380e9020FF4f7fFfE05a78D2153A7071153",
//           fromAmount: "10000000000000000",
//           fromChain: "42161",
//           fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//           slippage: "1",
//           stepType: "Squid",
//           toAddress: "sei12q45tpyvpuz0397qma3arx7hz4nypvtlfzteyk",
//           toChain: "pacific-1",
//           toToken: "usei",
//         },
//       ],
//       tx_hashes: [
//         "0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
//       ],
//     },
//   ],
// } as TxData;

const getBalanceFromPulsar = async (address: string, chain: string) => {
  console.log("getbalance", address, chain);
  let balance = [];
  if (chain === "SEI") {
    console.log({ address });
    balance = await fetchSEIBalance(address);
  }

  // const balances = pulsar.balances.getWalletBalances(address, chain);
  // for await (const b of balances) {
  //   balance.push(b);
  // }
  return balance;
};
async function fetchSEIBalance(walletAddress: string) {
  const REST_URL = "https://sei-api.polkachu.com/";
  const queryClient = await getQueryClient(REST_URL);
  const res = await queryClient.cosmos.bank.v1beta1.allBalances({
    address: walletAddress,
  });
  console.log("SEI BALANCE", res.balances);
  return res.balances;
}
