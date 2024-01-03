"use client";
import { Box, Button, Input, Tab, Tabs } from "@/components";
import { FaSearch } from "react-icons/fa";
import { useQRCode } from "next-qrcode";
import copy from "copy-to-clipboard";

export default function Transaction() {
  const { Canvas } = useQRCode();
  return (
    <div className="h-full w-full p-6">
      <Box className="h-full">
        <Tabs>
          <Tab label="Send Tokens">
            <div className="space-y-7 py-4">
              <Input placeholder="Amount" />
              <Input placeholder="Recipient Address" />
              <Button className="right-0 float-right block w-44">Next</Button>
            </div>
          </Tab>
          <Tab label="Receive Tokens">
            <div className="flex w-full flex-col items-center justify-center space-y-7 py-4">
              <Input placeholder="Search for a chain" startIcon={FaSearch} />
              <Input placeholder="Your Address" />
              <div
                onClick={() => copy("User's address")}
                className="relative cursor-pointer rounded-xl border border-zinc-800 p-6"
              >
                <Canvas
                  text={"User's address"}
                  options={{
                    errorCorrectionLevel: "M",
                    margin: 3,
                    scale: 4,
                    width: 200,
                  }}
                />
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
