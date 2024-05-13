"use client";

import { Account, Box, Divider, Text } from "@/components";
import { NewCoin, useNewBalances, useUSDTotalPrice } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { TargetChain } from "@/target-chain";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { FaExclamation } from "react-icons/fa6";

import { PendingAssets } from "./pending";

export const DashboardPage = observer(function Dashboard() {
  useCurrentWallet({ redirectTo: "/" });
  return (
    <div className="flex  w-full flex-col space-y-4 text-white">
      <Assets />
    </div>
  );
});

const Assets = observer(function Assets() {
  return (
    <Box className="h-full rounded-md text-xl">
      <div className="hidden  w-full flex-1 flex-col max-md:flex">
        <Account />
      </div>
      <div className="hidden flex-row justify-between md:flex ">
        <Text>Assets</Text>
        <Total />
      </div>

      <Divider className="mt-5 hidden md:block" />
      {/* create an alert banner to remind users to wait if a tx has just been issued */}
      <div className="mt-3 flex w-full flex-row items-center rounded-md bg-slate-600 p-2">
        <FaExclamation className="ml-2 mr-3" />
        <Text size="sm" className="leading-normal">
          Fast Travel transactions may take a few minutes to be processed and
          will appear here once visible on the network.
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

const AssetBalance = observer(function AssetBalance() {
  const publicKey = usePublicKey();
  const balances = useNewBalances({
    publicKey,
  });
  if (
    balances.every((b) => {
      return b.isLoading;
    })
  ) {
    return <span className="font-extrabold  text-white"> loading </span>;
  }
  const balance = balances.filter((b) => {
    return b.data && b.data.balances?.length > 0;
  });

  if (balance.length === 0) return null;

  return balance.map((b) => {
    return b.data?.balances.map((chainBalance) => {
      return (
        <NewAssetItem
          key={`${chainBalance.targetChainId}:${chainBalance.denom}`}
          coin={chainBalance}
        />
      );
    });
  });
});

function NewAssetItem({ coin }: { coin: NewCoin }) {
  const router = useRouter();

  const targetChain = TargetChain.chainId(coin.targetChainId);
  const assetData = targetChain.getAsset(coin.denom);
  const denomUnit = assetData?.denom_units.find((value) => {
    return value.denom === assetData.display;
  });
  const amount = new BigNumber(coin.amount).dividedBy(
    10 ** (denomUnit?.exponent ?? 0),
  );

  return (
    <div
      className="mb-3 mt-3 flex cursor-pointer flex-row items-center justify-between rounded-lg bg-gray-700 p-5 hover:bg-gray-600"
      onClick={() => {
        router.push(
          `/dashboard/transaction/send/${encodeURIComponent(
            `${coin.targetChainId}:${coin.denom}`,
          )}`,
        );
      }}
    >
      <div className="flex flex-row items-center">
        <div className="mr-3">
          {assetData?.images ? (
            <img
              src={assetData?.images[0]?.svg ?? assetData?.images[0]?.png ?? ""}
              alt={assetData?.symbol}
              className="h-8 w-8"
            />
          ) : (
            <div className="h-8 w-8" />
          )}
        </div>
        <div className="flex flex-row">
          <div className="mr-5 text-lg">
            <div>{assetData?.symbol}</div>
            <div className="text-xs opacity-60">(on {targetChain.label})</div>
          </div>
        </div>
      </div>
      <NewPriceComponent amount={amount} price={coin.price} />
    </div>
  );
}

function NewPriceComponent({
  amount,
  price,
}: {
  price: string;
  amount: BigNumber;
}) {
  const priceBn = new BigNumber(price);
  const total = priceBn.times(amount);

  return (
    <div className="flex flex-col items-end">
      <div className="text-md font-bold">{amount.toFixed(2)}</div>
      <div className="text-xs">${total.toFixed(2)}</div>
    </div>
  );
}
