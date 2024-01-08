"use client";
import { Box, Divider, IBalanceOption, Text, TravelModal } from "@/components";
import Image from "next/image";
import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { FaSketch } from "react-icons/fa6";

export default function FastTravel() {
  const assets = [
    {
      label: "NTRN",
      icon: <FaHome className="h-8 w-8 text-white" />,
    },
    {
      label: "NEWT",
      icon: <FaHome className="h-8 w-8 text-white" />,
    },
    {
      label: "AUTISM",
      icon: <FaHome className="h-8 w-8 text-white" />,
    },
    {
      label: "SEI",
      icon: <FaHome className="h-8 w-8 text-white" />,
    },
  ];
  const nfts = [
    {
      label: "MONKE",
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
      label: "Celestia Staking (Stakes 1 TIA for 100 Accounts)",
      icon: <FaHome className="h-8 w-8 text-white" />,
    },
  ];

  const balances: IBalanceOption[] = [
    {
      network: "Ethereum",
      assetUnit: "ETH",
      balance: 12,
      icon: FaSketch,
    },
    {
      network: "Neutron1",
      assetUnit: "NTRN1",
      balance: 120.55,
      icon: FaSketch,
    },
  ];

  const [isOpenTravelModal, setIsOpenTravelModal] = useState(false);

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
              cursor: "pointer",
            }} // optional
            onClick={() => setIsOpenTravelModal(true)}
          />
          <div className="mt-4 space-y-5 px-3">
            <div className="space-y-4">
              <Text size="xl">Assets</Text>
              <Divider />
              <div className="flex flex-row space-x-3">
                {assets.map((asset) => (
                  <Box
                    key={`asset-${asset.label}`}
                    className="flex flex-row space-x-3 bg-gray-700"
                  >
                    {asset.icon}
                    <Text>{asset.label}</Text>
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
                    <Text>{asset.label}</Text>
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
                    <Text>{asset.label}</Text>
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
                    <Text>{asset.label}</Text>
                  </Box>
                ))}
              </div>
            </div>
          </div>
        </Box>
        {isOpenTravelModal && <TravelModal balances={balances} />}
      </div>
    </div>
  );
}
