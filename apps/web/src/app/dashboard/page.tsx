"use client";

import { Box, Divider } from "@/components";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { PublicKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { toAssets } from "./fast-travel/assets";
type TxData = {
  squid_status: {
    axelarTransactionUrl: string;
    error: Record<string, unknown>;
    fromChain: {
      blockNumber: number;
      callEventLog: any[];
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
      callEventLog: any[];
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

const Assets = observer(() => {
  const publicKey = usePublicKey();

  return (
    <Box title="Assets" titleClassName="ml-2 text-xl" className=" rounded-md">
      <Divider className="mt-5" />

      <PendingAssets publicKey={publicKey as PublicKey} />
      <AssetBalance />
    </Box>
  );
});

const PendingAssets = observer(
  ({ publicKey }: { publicKey: PublicKey | null }) => {
    const prefixes = ["sei", "osmo", "neutron"];
    // get the wallet using the public key and prefixes

    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((asset) => (
      <AssetItem asset={asset} />
    ));
  },
);
const AssetBalance = observer(() => {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((asset) => (
    <AssetItem asset={asset} />
  ));
});
const AssetItem = ({ asset }: { asset: number }) => {
  const data = txData;
  const { transaction } = data;
  // we need to get the asset from the squid_status
  const assetData = transaction[0]?.steps[1];

  return (
    <div
      key={asset}
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
          <div className="mr-5 text-lg">{assetData?.toToken}</div>
          {/* <div className="text-sm">0.00</div> */}
          <div className="text-xl font-bold">{assetData?.fromAmount}</div>
        </div>
      </div>
      <div className="text-sm">{assetData?.fromAmount}</div>
    </div>
  );
};

const getPendingAssets = () => {};

const txData = {
  squid_status: {
    axelarTransactionUrl:
      "https://axelarscan.io/gmp/0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
    error: {},
    fromChain: {
      blockNumber: 173870219,
      callEventLog: [],
      callEventStatus: "",
      chainData: {
        axelarContracts: {
          forecallable: "0x2d5d7d31F671F86C782533cc367F14109a082712",
          gateway: "0xe432150cce91c13a887f7D836923d5597adD8E31",
        },
        blockExplorerUrls: ["https://arbiscan.io/"],
        chainIconURI:
          "https://raw.githubusercontent.com/0xsquid/assets/main/images/tokens/arb.svg",
        chainId: 42161,
        chainName: "Arbitrum",
        chainNativeContracts: {
          ensRegistry: "",
          multicall: "0xcA11bde05977b3631167028862bE2a173976CA11",
          usdcToken: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
          wrappedNativeToken: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        },
        chainType: "evm",
        compliance: {
          trmIdentifier: "arbitrum",
        },
        estimatedExpressRouteDuration: 20,
        estimatedRouteDuration: 1800,
        nativeCurrency: {
          decimals: 18,
          icon: "https://raw.githubusercontent.com/axelarnetwork/axelar-docs/main/public/images/chains/arbitrum.svg",
          name: "Arbitrum",
          symbol: "ETH",
        },
        networkName: "Arbitrum",
        rpc: "https://arb1.arbitrum.io/rpc",
        squidContracts: {
          defaultCrosschainToken: "0xEB466342C4d449BC9f53A865D5Cb90586f405215",
          squidFeeCollector: "0x19cd4F3820E7BBed45762a30BFA37dFC6c9C145b",
          squidMulticall: "0x4fd39C9E151e50580779bd04B1f7eCc310079fd3",
          squidRouter: "0xce16F69375520ab01377ce7B88f5BA8C48F8D666",
        },
        swapAmountForGas: "2000000",
      },
      transactionId:
        "0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
      transactionUrl:
        "https://arbiscan.io/tx/0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
    },
    gasStatus: "gas_paid",
    id: "0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf_2_14",
    isGMPTransaction: true,
    routeStatus: [
      {
        action: "call",
        chainId: 42161,
        status: "success",
        txHash:
          "0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
      },
    ],
    squidTransactionStatus: "ongoing",
    status: "source_gateway_called",
    timeSpent: {
      total: 374,
    },
    toChain: {
      blockNumber: "",
      callEventLog: [],
      callEventStatus: "",
      transactionId: "",
      transactionUrl: "",
    },
  },
  transaction: [
    {
      deposit_address: "0xdb1dfde093058ad27f98d6210500d1da11ff4d73",
      id: 21,
      status: "AwaitingWithdrawal",
      steps: [
        {
          enableForecall: null,
          fromAddress: null,
          fromAmount: null,
          fromChain: "arbitrum",
          fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          slippage: null,
          stepType: "EthDeposit",
          toAddress: null,
          toChain: null,
          toToken: null,
        },
        {
          enableForecall: false,
          fromAddress: "0xeCbFB380e9020FF4f7fFfE05a78D2153A7071153",
          fromAmount: "10000000000000000",
          fromChain: "42161",
          fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          slippage: "1",
          stepType: "Squid",
          toAddress: "sei12q45tpyvpuz0397qma3arx7hz4nypvtlfzteyk",
          toChain: "pacific-1",
          toToken: "usei",
        },
      ],
      tx_hashes: [
        "0x3b655af324e7bae0a05c7efc7333fd30d28b1515e8205e2677fad8c46507b5bf",
      ],
    },
  ],
} as TxData;
