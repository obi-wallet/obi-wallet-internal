"use client";

import { Box, Divider, Text, TravelModal } from "@/components";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useState } from "react";

import { toAssets } from "./assets";

export default observer(function FastTravel() {
  const [targetAsset, setTargetAsset] = useState<string | undefined>(undefined);

  return (
    <div className="relative w-full text-white">
      <Box className="px-0 pt-0 max-md:m-2 max-sm:bg-transparent">
        <div className="relative">
          <Image
            src="/travel.png"
            alt="fast-travel"
            width={0}
            height={0}
            sizes="100vw"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 6,
            }}
            className="opacity-40 max-lg:!h-[240px] max-sm:!h-40"
          />
          <div className="absolute top-0 flex h-full w-full flex-col justify-center p-10 max-sm:p-3">
            <h1 className="mb-4 text-4xl font-bold text-white max-md:text-3xl max-sm:text-xl">
              Obi Fast Travel
            </h1>
            <h2 className="text-xl font-bold text-white max-md:text-lg max-sm:text-base">
              Skip the research and hassle of migrating to new ecosystems.
              Select an asset below to receive it in your Obi account.
            </h2>
          </div>
        </div>
        <div className="mt-4 space-y-5 px-5 max-sm:px-0">
          <div className="space-y-4">
            <Text size="xl">Assets</Text>
            <Divider />
            <div className="space-evenly grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {Object.keys(toAssets)?.map((assetKey) => (
                <Box
                  key={`asset-${assetKey}`}
                  className={cn(
                    " hover:bg-background-primary-hover col-span-1 flex w-full cursor-pointer flex-row bg-gray-700",
                    toAssets[assetKey]?.disabled &&
                      "cursor-not-allowed opacity-50 hover:bg-gray-700",
                  )}
                  onClick={() => {
                    if (toAssets[assetKey]?.disabled) return;
                    setTargetAsset(assetKey);
                  }}
                >
                  {toAssets[assetKey]?.image && (
                    <Image
                      alt={toAssets[assetKey]?.label ?? ""}
                      src={toAssets[assetKey]?.image ?? ""}
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                  )}

                  <Text>
                    {toAssets[assetKey]?.label}{" "}
                    {toAssets[assetKey]?.disabled && "(soon)"}
                  </Text>
                </Box>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Text size="xl">NFTs</Text>
            <Divider />
            <div className="flex flex-row space-x-3">
              {nfts.map((asset) => (
                <Box
                  key={`nft-${asset.label}`}
                  className="flex cursor-not-allowed flex-row space-x-3 bg-gray-700 opacity-50"
                >
                  <Text>{asset.label} (soon)</Text>
                </Box>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Text size="xl">Vaults</Text>
            <Divider />
            <div className="flex flex-row max-lg:flex-col max-lg:space-y-3 lg:space-x-3">
              {vaults.map((asset) => (
                <Box
                  key={`vault-${asset.label}`}
                  className="flex cursor-not-allowed flex-row space-x-3 bg-gray-700 opacity-50"
                >
                  <div className="relative aspect-square w-full max-w-[35px] ">
                    <Image
                      alt={asset.label}
                      src={asset.image ?? ""}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <Text>{asset.label} (soon)</Text>
                </Box>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Text size="xl">Airdrop Farming</Text>
            <Divider />
            <div className="flex flex-row space-x-3">
              {farms.map((asset) => (
                <Box
                  key={`farm-${asset.label}`}
                  className={cn(
                    "flex flex-row space-x-3 bg-gray-700",
                    "cursor-not-allowed opacity-50 ",
                  )}
                >
                  {asset.image && (
                    <div className="relative aspect-square w-full max-w-[35px] ">
                      <Image
                        alt={asset.label}
                        src={asset.image ?? ""}
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  )}
                  <Text className="leading-4">{asset.label} (soon)</Text>
                </Box>
              ))}
            </div>
          </div>
        </div>
      </Box>
      {targetAsset ? (
        <TravelModal
          modal
          targetAsset={targetAsset || ""}
          onDismiss={() => {
            setTargetAsset(undefined);
          }}
        />
      ) : null}
    </div>
  );
});
const nfts = [
  {
    label: "Bad Kids",
    image: null,
  },
];
const vaults = [
  {
    label: "Apollo's wstETH/axlWETH 7d Locked LP Vault 33.42% APY",
    image:
      "https://assets.coingecko.com/coins/images/34792/large/apollo-png-256.png?1706031403",
  },
  {
    label: "Apollo's stTIA/TIA Capped LP Vault 44.45% APY",

    image:
      "https://assets.coingecko.com/coins/images/34792/large/apollo-png-256.png?1706031403",
  },
  {
    label: "Apollo's NTRN/wstETH 7d Locked LP Vault 101.26% APY",
    image:
      "https://assets.coingecko.com/coins/images/34792/large/apollo-png-256.png?1706031403",
  },
];

const farms = [
  {
    label: "Staking assets",
    image: null,
  },
];
