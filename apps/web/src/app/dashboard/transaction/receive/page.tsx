"use client";

import { Box, Input, TabUi } from "@/components";
import { usePublicKey } from "@/hooks/use-public-key";
import { TargetChain, TargetChainId } from "@/target-chain";

import copy from "copy-to-clipboard";
import { observer } from "mobx-react-lite";
import { useQRCode } from "next-qrcode";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default observer(function Receive() {
  const { Canvas } = useQRCode();
  const [chainId, _setChainId] = useState<TargetChainId | null>(
    TargetChainId.Sei,
  );
  const [isCopied, setIsCopied] = useState(false);

  const sdk = chainId ? TargetChain.chainId(chainId) : null;
  const publicKey = usePublicKey();
  const chainLabel = sdk?.label ?? "";
  const address = publicKey && sdk ? sdk.computeAddress(publicKey) : null;

  const handleClickQRCode = () => {
    if (!address) return;

    copy(address);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="h-full w-full p-6">
      <Box className="w-2/3">
        <TabUi.Links>
          <TabUi.Link href="/dashboard/transaction/send">
            Send Tokens
          </TabUi.Link>
          <TabUi.Link href="/dashboard/transaction/receive" active>
            Receive Tokens
          </TabUi.Link>
        </TabUi.Links>

        <TabUi.Main>
          <div className="flex w-full flex-col items-center justify-center space-y-7 py-4">
            <Input
              placeholder="Search for a chain"
              startIcon={FaSearch}
              value={chainLabel}
            />
            <Input placeholder="Your Address" value={address ?? ""} />
            {address ? (
              <div className="relative cursor-pointer rounded-xl border border-zinc-800 p-6">
                <div onClick={handleClickQRCode}>
                  <Canvas
                    text={address}
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
            ) : null}
          </div>
        </TabUi.Main>
      </Box>
    </div>
  );
});
