"use client";

import { Box, Divider, IBalanceOption, Text, TravelModal } from "@/components";
import { useCosmosAddress, useEvmAddress } from "@/hooks/use-address";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { FaSketch } from "react-icons/fa6";
import { FromAsset, ToAsset, fromAssets, toAssets } from "./assets";

export default observer(function FastTravel() {
  console.log(useCosmosAddress("cosmos"));
  console.log(useEvmAddress());

  type FormData = {
    fromChain?: string;
    toChain?: string;
    fromAmount?: number;
    toAddress?: string;
    maxSlippage?: number;
  };

  const [isOpenTravelModal, setIsOpenTravelModal] = useState(true);
  const [targetAsset, setTargetAsset] = useState<string | null>(null);

  return (
    <div className="h-full w-full px-7 py-5">
      <div className="relative h-full w-full text-white">
        <Box className="h-full px-0 pt-0">
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
            }} // optional
            // onClick={() => setIsOpenTravelModal(true)}
          />
          <div className="mt-4 space-y-5 px-3">
            <div className="space-y-4">
              <Text size="xl">Assets</Text>
              <Divider />
              <div className="flex flex-row space-x-3">
                {Object.keys(toAssets)?.map((assetKey) => (
                  <Box
                    key={`asset-${assetKey}`}
                    className=" flex cursor-pointer flex-row space-x-3 bg-gray-700 hover:bg-blue-600"
                    onClick={() => {
                      setTargetAsset(assetKey);
                      setIsOpenTravelModal(true);
                    }}
                  >
                    {toAssets[assetKey]?.image}
                    <Text>{toAssets[assetKey]?.label}</Text>
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
                    className="flex flex-row space-x-3 bg-gray-700"
                  >
                    {asset.icon}
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
                    className="flex flex-row space-x-3 bg-gray-700"
                  >
                    {asset.icon}
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
                    className="flex flex-row space-x-3 bg-gray-700"
                  >
                    {asset.icon}
                    <Text>{asset.label} (soon)</Text>
                  </Box>
                ))}
              </div>
            </div>
          </div>
        </Box>
        {isOpenTravelModal && (
          <TravelModal
            fromAssets={fromAssets}
            toAssets={toAssets}
            targetAsset={targetAsset}
            onDismiss={() => {
              setTargetAsset(null);
              setIsOpenTravelModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
});
