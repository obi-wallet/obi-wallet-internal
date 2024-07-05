"use client";

import { Account, Divider, Text, Button } from "@/components";
import { AssetWithPrice, useBalances } from "@/hooks/balances";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { TargetChain } from "@/target-chain";
import { Input } from "@/ui/input";
import { AssetInfo } from "@obi-wallet/sdk-abstract-target-chain";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { CiSearch } from "react-icons/ci";

import { PendingAssets } from "./pending";

interface PrettyAssetData extends AssetWithPrice {
  usdBalance: BigNumber;
  prettyAmount: BigNumber;
  assetInfo: AssetInfo | null;
}

export const DashboardPage = observer(function Dashboard() {
  useCurrentWallet({ redirectTo: "/" });

  return (
    <div className="flex w-full flex-col text-white">
      <Assets />
    </div>
  );
});

const Assets = observer(function Assets() {
  const [searchAsset, setSearchAsset] = useState("");
  return (
    <>
      <div className="hidden w-full flex-1 flex-col max-md:flex">
        <Account />
        <Button
          href="/dashboard/import-new-asset/"
          className="flex-1 rounded-lg border-dashed border-blue-500 bg-transparent justify-center text-sm font-normal p-2 mb-2"
        >
          Import New Asset
        </Button>
      </div>
      <div className="hidden flex-row gap-3 md:flex items-center">
        <Input
          className="mt-0 px-3 py-1.5"
          leftComponent={<CiSearch className="h-6 w-6" color="white" />}
          labelClassname="bg-background-secondary"
          placeholder="Search Assets"
          value={searchAsset}
          onChange={(asset) => {
            setSearchAsset(asset);
          }}
          inputClassName="ml-2"
        />
        <Button
          href="/dashboard/import-new-asset/"
          className="rounded-lg border-dashed border-blue-500 bg-transparent justify-center text-sm font-normal w-64 h-9"
        >
          Import New Asset
        </Button>
      </div>

      <Divider className="mt-5 hidden md:block" />
      {/* create an alert banner to remind users to wait if a tx has just been issued */}

      <PendingAssets />
      <AssetBalance searchAsset={searchAsset.toLowerCase()} />
      <div className="mt-10 flex w-full flex-row items-center justify-center max-md:px-2">
        <Text size="sm" className="leading-normal" fontWeight="light">
          Fast Travel transactions may take a few minutes to be processed and
          will appear here once visible on the network.
        </Text>
      </div>
    </>
  );
});

const AssetBalance = observer(function AssetBalance({
  searchAsset,
}: {
  searchAsset: string;
}) {
  const balances = useBalances();

  if (
    balances.every((b) => {
      return b.isLoading;
    })
  ) {
    return <span className="font-extrabold  text-white"> loading </span>;
  }

  const prettyBalances = balances
    .map((balance) => {
      const chain: { label: string; image: string } = {
        label: "",
        image: "",
      };
      const prettyData: PrettyAssetData[] = (
        balance.data?.map((asset) => {
          const targetChain = TargetChain.chainId(asset.chainId);
          chain.label = targetChain.label;
          chain.image = targetChain.image;

          const assetInfo = targetChain.assetInfo(asset.assetId);
          const amount = new BigNumber(asset.rawAmount).dividedBy(
            10 ** (assetInfo?.decimals ?? 0),
          );

          const priceBn = new BigNumber(asset.price);
          const usdBalance = priceBn.times(amount);
          return {
            ...asset,
            usdBalance,
            prettyAmount: amount,
            assetInfo,
          };
        }) ?? []
      )
        .filter((asset) => {
          return (asset.assetInfo?.symbol.toLowerCase() ?? "").includes(
            searchAsset,
          );
        })
        .sort((assetA, assetB) => {
          if (assetA.usdBalance < assetB.usdBalance) return 1;
          return -1;
        });

      return { ...balance, prettyData, chain };
    })
    .filter((balance) => {
      return balance.prettyData.length > 0;
    })
    .sort((balanceA, balanceB) => {
      const balanceAValueSum = balanceA.prettyData.reduce((acc, curr) => {
        return acc.plus(curr.usdBalance);
      }, new BigNumber(0));
      const balanceBValueSum = balanceB.prettyData.reduce((acc, curr) => {
        return acc.plus(curr.usdBalance);
      }, new BigNumber(0));
      if (balanceAValueSum.lt(balanceBValueSum)) return 1;
      return -1;
    });

  return (
    <div className="flex flex-col gap-10">
      {prettyBalances.map((chainBalance) => {
        if (!chainBalance.data || chainBalance.data.length === 0) return null;

        return (
          <Fragment key={chainBalance.chain.label}>
            <NetworkAssets assets={chainBalance} />
          </Fragment>
        );
      })}
    </div>
  );
});

function NetworkAssets({
  assets,
}: {
  assets: {
    prettyData: PrettyAssetData[];
    chain: {
      label: string;
      image: string;
    };
  };
}) {
  return (
    <div>
      <div
        className="rounded-t-lg px-4 py-1.5"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)",
        }}
      >
        <div className="flex flex-row items-center gap-2">
          <img
            src={assets.chain.image}
            alt={assets.chain.label}
            className="h-5 w-5 sm:h-8 sm:w-8"
          />
          <Text className=" text-xs text-white opacity-70">
            {assets.chain.label}
          </Text>
        </div>
      </div>
      <div className="flex gap-5 py-1.5 pl-4 sm:flex">
        <div className="flex w-full justify-between ">
          <Text fontWeight="light" className="text-[10px] text-slate-400">
            ASSET
          </Text>

          <Text fontWeight="light" className="text-[10px] text-slate-400">
            BALANCE
          </Text>

          <Text fontWeight="light" className="text-[10px] text-slate-400">
            VALUE
          </Text>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        {assets.prettyData.map((data) => {
          return (
            <Fragment key={`${assets.chain.label}-${data.assetId}`}>
              <AssetItem asset={data} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function AssetItem({ asset }: { asset: PrettyAssetData }) {
  const router = useRouter();

  return (
    <div
      className="hover:bg-asset-hover-gradient flex w-full cursor-pointer justify-between gap-5  py-1.5  pl-4  hover:rounded-lg"
      onClick={() => {
        router.push(
          `/dashboard/transaction/send/${encodeURIComponent(
            `${asset.chainId}:${asset.assetId}`,
          )}`,
        );
      }}
    >
      <div className="flex flex-row gap-2 ">
        {asset.assetInfo?.image ? (
          <img
            src={asset.assetInfo.image}
            alt={asset.assetInfo.symbol}
            className="h-6 w-6 sm:h-8 sm:w-8"
          />
        ) : (
          <div className="h-6 w-6 sm:h-8 sm:w-8" />
        )}

        <Text fontWeight="bold" className="max-sm:text-sm ">
          {asset.assetInfo?.symbol}
        </Text>
      </div>

      <Text className=" -ml-6 max-sm:text-sm ">
        {asset.prettyAmount.toString()}
      </Text>
      <Text fontWeight="bold" className=" max-sm:text-sm">
        ${asset.usdBalance.toFixed(2)}
      </Text>
    </div>
  );
}
