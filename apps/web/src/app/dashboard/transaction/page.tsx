"use client";
import {
  BalanceInput,
  Box,
  Button,
  IBalanceOption,
  Input,
  Tab,
  Tabs,
} from "@/components";
import copy from "copy-to-clipboard";
import { useQRCode } from "next-qrcode";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaSketch } from "react-icons/fa6";

export default function Transaction() {
  const { Canvas } = useQRCode();
  const [isCopied, setIsCopied] = useState(false);

  const balances: IBalanceOption[] = [
    {
      network: "Neutron",
      assetUnit: "NTRN",
      balance: 140.44,
      icon: FaSketch,
    },
    {
      network: "Neutron1",
      assetUnit: "NTRN1",
      balance: 120.55,
      icon: FaSketch,
    },
  ];

  const handleClickQRCode = () => {
    copy("User's address");
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="h-full w-full p-6">
      <Box className="w-2/3">
        <Tabs>
          <Tab label="Send Tokens">
            <div className="space-y-7 py-4">
              <BalanceInput placeholder="Amount" balances={balances} />
              <Input placeholder="Recipient Address" />
              <div className="flex justify-end">
                <Button className="block w-44">Next</Button>
              </div>
            </div>
          </Tab>
          <Tab label="Receive Tokens">
            <div className="flex w-full flex-col items-center justify-center space-y-7 py-4">
              <Input placeholder="Search for a chain" startIcon={FaSearch} />
              <Input placeholder="Your Address" />
              <div className="relative cursor-pointer rounded-xl border border-zinc-800 p-6">
                <div onClick={handleClickQRCode}>
                  <Canvas
                    text={"User's address"}
                    options={{
                      errorCorrectionLevel: "M",
                      margin: 3,
                      scale: 4,
                      width: 200,
                    }}
                  />
                </div>
                {isCopied && (
                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-4 rounded-md bg-gray-500 px-4 py-2 text-center text-white">
                    <p>Copied</p>
                  </div>
                )}
                <label className="absolute left-0 top-0 ml-5 -translate-y-1/2 bg-slate-950 px-2 py-1 text-xs text-white">
                  Click to Copy
                </label>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Box>
    </div>
  );
}
