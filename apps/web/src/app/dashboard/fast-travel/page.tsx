"use client";

import { Box, Divider, Text, TravelModal } from "@/components";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useState } from "react";
import { FaHome } from "react-icons/fa";

import { toAssets } from "./assets";

export default observer(function FastTravel() {
  const [isOpenTravelModal, setIsOpenTravelModal] = useState(false);
  const [targetAsset, setTargetAsset] = useState<string | undefined>(undefined);

  return (
    <div className="h-full w-full px-7 py-5">
      <div className="relative h-full w-full text-white">
        <Box className="pt-0 max-sm:bg-transparent">
          <div className="relative h-fit">
            <Image
              src="/travel.png"
              alt="fast-travel"
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 6,
              }}
              className="opacity-40 max-sm:!h-56"
            />
            <div className="absolute top-0 flex h-full w-full flex-col justify-center p-10 ">
              <h1 className="mb-4 text-4xl font-bold text-white">
                Obi Fast Travel
              </h1>
              <h2 className="text-xl font-bold text-white">
                Skip the research and hassle of migrating to new ecosystems.
                Select an asset below to receive it in your Obi account.
              </h2>
            </div>
          </div>
          <div className="mt-4 space-y-5 px-3 max-sm:px-0">
            <div className="space-y-4">
              <Text size="xl">Assets</Text>
              <Divider />
              <div className="space-evenly flex flex-row flex-wrap gap-4">
                {Object.keys(toAssets)?.map((assetKey) => (
                  <Box
                    key={`asset-${assetKey}`}
                    className={cn(
                      " hover:bg-background-primary-hover flex cursor-pointer flex-row bg-gray-700 sm:min-w-[170px]",
                      toAssets[assetKey]?.disabled &&
                        "cursor-not-allowed opacity-50 hover:bg-gray-700",
                    )}
                    onClick={() => {
                      if (toAssets[assetKey]?.disabled) return;
                      setTargetAsset(assetKey);
                      setIsOpenTravelModal(true);
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
              <div className="flex flex-row space-x-3">
                {vaults.map((asset) => (
                  <Box
                    key={`vault-${asset.label}`}
                    className="flex cursor-not-allowed flex-row space-x-3 bg-gray-700 opacity-50"
                  >
                    {/* {asset.icon} */}
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
                    <Text>{asset.label} (soon)</Text>
                  </Box>
                ))}
              </div>
            </div>
          </div>
        </Box>
        {isOpenTravelModal && (
          <TravelModal
            targetAsset={targetAsset || ""}
            onDismiss={() => {
              setTargetAsset(undefined);
              setIsOpenTravelModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
});
const nfts = [
  {
    label: "Bad Kids",
    icon: <FaHome className="h-8 w-8 text-white" />,
  },
];
const vaults = [
  {
    label: "Sommelier Finance: Real Yield ETH - 14.42% ",
    icon: <FaHome className="h-8 w-8 text-white" />,
  },
];
const farms = [
  {
    label: "Staking assets",

    icon: <FaHome className="h-8 w-8 text-white" />,
  },
];
