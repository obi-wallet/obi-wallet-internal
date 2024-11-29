"use client";

import { ChainDropdown, TabUi, useChainOptions } from "@/components";
import { useAddressQuery } from "@/hooks/address";
import { TargetChainId } from "@/target-chain";
import { urlDecodeCatchAllParam } from "@/util/url-decode-catch-all-param";
import {
  Caip19AssetId,
  Caip2ChainId,
  parseCaip19AssetId,
  parseCaip2ChainId,
} from "@obi-wallet/sdk-caip";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react-lite";
import { useQRCode } from "next-qrcode";
import { use, useState } from "react";
import { FaCheck } from "react-icons/fa6";

export default observer<{ params: Promise<{ asset?: string[] }> }>(
  function Receive(props) {
    const params = use(props.params);
    const [chainId, setChainId] = useState<TargetChainId | null>(null);
    const { options, initialValue } = useChainOptions();

    const getChainId = () => {
      // User has selected a chain
      if (chainId) {
        return chainId;
      }

      // User has not selected a chain, but the URL has a chain
      try {
        const assetParam = urlDecodeCatchAllParam(params.asset ?? []);
        if (assetParam) {
          try {
            // Try parsing as CAIP-19 asset ID
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const result = parseCaip19AssetId(assetParam as Caip19AssetId);
            if (!result) return initialValue;

            const chainOption = options.find((chain) => {
              return chain.value === result.chainId;
            });
            if (chainOption) {
              return chainOption.value;
            }
          } catch {
            // If that fails, try parsing as CAIP-2 chain ID
            try {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              const result = parseCaip2ChainId(assetParam as Caip2ChainId);
              if (!result) return initialValue;

              const chainId = `${result.namespace}:${result.reference}`;
              const chainOption = options.find((chain) => {
                return chain.value === chainId;
              });
              if (chainOption) {
                return chainOption.value;
              }
            } catch (e) {
              console.error("Failed to parse chain ID:", e);
            }
          }
        }
      } catch (e) {
        console.error("Failed to decode asset param:", e);
      }

      // User has not selected a chain and the URL does not have a chain
      return initialValue;
    };

    const chainIdToUse = getChainId();

    if (chainIdToUse) {
      return <ReceiveInner chainId={chainIdToUse} setChainId={setChainId} />;
    }

    return null;
  },
);

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
      <div className="flex w-full flex-col items-start gap-4 py-2.5">
        {/* Chain Dropdown */}
        <div className="h-standardField flex w-full items-center rounded-[5px] border border-[#32c9af] p-2.5">
          <ChainDropdown onChange={setChainId} chainId={chainId} />
        </div>

        {/* Click to Copy Text */}
        <div className="font-['Roboto Mono'] text-sm font-normal text-white">
          Click or tap to copy your address
        </div>

        {/* Address Display */}
        {address ? (
          <div
            onClick={handleClickQRCode}
            className="flex w-full cursor-pointer items-center rounded-[5px] border border-[#32c9af] px-2.5 py-2.5"
          >
            <span className="font-['Roboto Mono'] w-full break-all text-center text-lg font-normal text-white">
              {address}
            </span>
          </div>
        ) : null}

        {/* QR Code */}
        {address ? (
          <div
            onClick={handleClickQRCode}
            className="mt-4 flex w-full cursor-pointer items-start"
          >
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
        ) : null}

        {/* Copied Notification */}
        {isCopied && (
          <div className="mt-2 flex items-center gap-2 text-green-500">
            <FaCheck />
            <p className="text-white">Copied</p>
          </div>
        )}
      </div>
    </TabUi.Main>
  );
});
