"use client";

import { usePublicKey } from "@/hooks/use-public-key";
import { allTargetChainIds, TargetChain, TargetChainId } from "@/target-chain";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { EvmChainId } from "@/target-chain/evm/chains";
import { useQuery } from "@obi-wallet/headless-ui";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { skipToken } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

async function computeKadoUrl(publicKey: Secp256k1PublicKey): Promise<string> {
  interface KadoNetwork {
    network: string;
    address: string;
  }

  const networks = (
    await Promise.all(
      allTargetChainIds.map(
        async (targetChainId): Promise<KadoNetwork | null> => {
          const targetChain = TargetChain.chainId(targetChainId);

          if (targetChain.disabled) {
            return null;
          }

          const kadoNetwork = toKadoNetwork(targetChainId);

          if (!kadoNetwork) {
            return null;
          }

          return {
            network: kadoNetwork,
            address: await targetChain.obiAccountAddress(publicKey),
          };
        },
      ),
    )
  ).filter((network): network is KadoNetwork => {
    return !!network;
  });

  const networkList = networks
    .map((network) => {
      return network.network;
    })
    .join(",");

  const onToAddressMulti = networks
    .map((network) => {
      return `${network.network}:${network.address}`;
    })
    .join(",");

  const url = new URL("https://app.kado.money");
  url.searchParams.append("apiKey", "0a5fc82b-be15-4059-8edf-9ff9c54186ce");
  url.searchParams.append("onPayAmount", "100");
  url.searchParams.append("product", "BUY");
  url.searchParams.append("productList", "BUY");
  url.searchParams.append("networkList", networkList);
  url.searchParams.append("onToAddressMulti", onToAddressMulti);
  url.searchParams.append("network", "SEI");
  url.searchParams.append("onRevCurrency", "SEI");

  return url.toString();
}

function toKadoNetwork(targetChainId: TargetChainId): string | null {
  switch (targetChainId) {
    case CosmosSdkChainId.Sei:
      return "SEI";
    case CosmosSdkChainId.Osmosis:
      return "OSMOSIS";
    case CosmosSdkChainId.Neutron:
      return "NEUTRON";
    case CosmosSdkChainId.Stargaze:
      return "STARGAZE";
    case CosmosSdkChainId.Tia:
      return "CELESTIA";
    case CosmosSdkChainId.Inj:
      return "INJECTIVE";
    case EvmChainId.Arbitrum:
      return "ARBITRUM";
    case EvmChainId.Avalanche:
      return "AVALANCHE";
    case EvmChainId.Base:
      return "BASE";
    case EvmChainId.Ethereum:
      return "ETHEREUM";
    case EvmChainId.Optimism:
      return "OPTIMISM";
    case EvmChainId.Polygon:
      return "POLYGON";
    case EvmChainId.ArbitrumTestnet:
    case EvmChainId.BaseTestnet:
    case EvmChainId.Bsc:
    case EvmChainId.BscTestnet:
    case EvmChainId.Cronos:
    case EvmChainId.EthereumTestnet:
    case EvmChainId.Zora:
      return null;
  }
}

export default observer(function BuyCrypto() {
  const publicKey = usePublicKey();

  const kadoUrl = useQuery({
    queryKey: ["kado-url", publicKey],
    queryFn: publicKey
      ? async () => {
          return await computeKadoUrl(publicKey);
        }
      : skipToken,
  });

  if (!kadoUrl.data) {
    return null;
  }

  return (
    <div className="h-full w-full">
      <iframe
        src={kadoUrl.data.toString()}
        className=" h-full w-[500px] max-md:w-full"
      />
    </div>
  );
});
