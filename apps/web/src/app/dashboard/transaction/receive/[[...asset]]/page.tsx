"use client";

import { ChainDropdown, TabUi, useChainOptions } from "@/components";
import { useAddressQuery } from "@/hooks/address";
import { TargetChainId } from "@/target-chain";
import { InputContainer } from "@/ui/container";
import { urlDecodeCatchAllParam } from "@/util/url-decode-catch-all-param";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react-lite";
import { useQRCode } from "next-qrcode";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";

export default observer<{ params: { asset?: string[] } }>(function Receive({
  params,
}) {
  const [chainId, setChainId] = useState<TargetChainId | null>(null);
  const chainOptions = useChainOptions();

  const getChainId = () => {
    // User has selected a chain
    if (chainId) {
      return chainId;
    }

    // User has not selected a chain, but the URL has a chain
    try {
      const assetParam = urlDecodeCatchAllParam(params.asset ?? []);
      if (assetParam) {
        const { chainId } = parseCaip19AssetId(
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          assetParam as Caip19AssetId,
        );
        const chainOption = chainOptions.find((chain) => {
          return chain.value === chainId;
        });
        if (chainOption) {
          return chainOption.value;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // User has not selected a chain and the URL does not have a chain
    return chainOptions[0]?.value ?? null;
  };

  const chainIdToUse = getChainId();

  if (chainIdToUse) {
    return <ReceiveInner chainId={chainIdToUse} setChainId={setChainId} />;
  }

  return null;
});

const ReceiveInner = observer<{
  chainId: TargetChainId;
  setChainId: (chainId: TargetChainId) => void;
}>(function ReceiveInner({ chainId, setChainId }) {
  const { Canvas } = useQRCode();
  const [isCopied, setIsCopied] = useState(false);
  const { data: address } = useAddressQuery(chainId);

  const handleClickQRCode = () => {
    if (!address) return;

    copy(address);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <TabUi.Main>
      <div className="flex w-full flex-col items-center justify-center space-y-7 py-4">
        <InputContainer
          className="relative z-10 w-80"
          label="Chain"
          labelClassname="bg-background-secondary"
        >
          <ChainDropdown onChange={setChainId} chainId={chainId} />
        </InputContainer>
        {address ? (
          <InputContainer
            label="Address"
            labelClassname="bg-background-secondary"
            onClick={handleClickQRCode}
            className="relative z-0 flex w-80 flex-col"
          >
            <div className="flex flex-1 items-center justify-center transition duration-300 group-hover:scale-105 group-active:scale-100">
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

            <div
              className={`absolute bottom-0 left-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-4 rounded-md bg-gray-500 px-4 py-2 text-center text-white transition duration-200 ease-in-out ${
                isCopied
                  ? "visible bottom-1/2 opacity-100"
                  : "invisible bottom-0 opacity-0"
              } transition-visibility`}
            >
              <span className="text-green-500">
                <FaCheck />
              </span>
              <p>Copied</p>
            </div>

            <div className="flex flex-col items-center">
              <span className="mt-5 text-center text-xs text-white">
                {address}
              </span>
              <span className="mt-1 text-center text-sm font-bold uppercase text-blue-600 transition duration-300 group-hover:scale-105 group-active:scale-100">
                Click to Copy
              </span>
            </div>
          </InputContainer>
        ) : null}
      </div>
    </TabUi.Main>
  );
});
