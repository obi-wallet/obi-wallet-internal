"use client";

import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { usePublicKey } from "@/hooks/use-public-key";
import { rootStore } from "@/stores";
import { TargetChainId } from "@/target-chain";
import { CosmosChainId } from "@/target-chain/cosmos/chains";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import { SecretChainId } from "@/target-chain/secret/chains";
import { filterMap } from "@/util/filter-map";
import { useQuery } from "@obi-wallet/headless-ui";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { skipToken } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";

async function computeKadoUrl({
  publicKey,
  userEntryAddress,
}: {
  publicKey: Secp256k1PublicKey;
  userEntryAddress: string;
}): Promise<string> {
  interface KadoNetwork {
    network: string;
    address: string;
  }

  const targetChains =
    rootStore.current?.targetChainsStore.getTargetChains(userEntryAddress) ??
    [];
  const networks = await filterMap(
    async (chain): Promise<KadoNetwork | null> => {
      if (!chain.enabled) {
        return null;
      }

      const kadoNetwork = toKadoNetwork(chain.id);

      if (!kadoNetwork) {
        return null;
      }

      return {
        network: kadoNetwork,
        address: await chain.targetChain.obiAccountAddress(publicKey),
      };
    },
    targetChains,
    { catchErrors: true },
  );

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

  console.log(url.toString());

  return url.toString();
}

function toKadoNetwork(targetChainId: TargetChainId): string | null {
  switch (targetChainId) {
    case CosmosChainId.Sei:
      return "SEI";
    case CosmosChainId.Osmosis:
      return "OSMOSIS";
    case CosmosChainId.Neutron:
      return "NEUTRON";
    case CosmosChainId.Stargaze:
      return "STARGAZE";
    case CosmosChainId.Tia:
      return "CELESTIA";
    case CosmosChainId.Inj:
      return "INJECTIVE";
    case Eip155ChainId.Arbitrum:
      return "ARBITRUM";
    case Eip155ChainId.Avalanche:
      return "AVALANCHE";
    case Eip155ChainId.Base:
      return "BASE";
    case Eip155ChainId.Ethereum:
      return "ETHEREUM";
    case Eip155ChainId.Optimism:
      return "OPTIMISM";
    case Eip155ChainId.Polygon:
      return "POLYGON";
    case Eip155ChainId.ArbitrumTestnet:
    case Eip155ChainId.BaseTestnet:
    case Eip155ChainId.Bsc:
    case Eip155ChainId.BscTestnet:
    case Eip155ChainId.Cronos:
    case Eip155ChainId.EthereumTestnet:
    case Eip155ChainId.Zora:
      return null;
    case SecretChainId.Secret:
      return "SECRET";
  }
}

export default observer(function BuyCrypto() {
  const wallet = useCurrentWallet({});
  const publicKey = usePublicKey();

  const kadoUrl = useQuery({
    queryKey: ["kado-url", publicKey],
    queryFn:
      wallet && publicKey
        ? async () => {
            return await computeKadoUrl({
              publicKey,
              userEntryAddress: wallet.userEntryAddress,
            });
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
        className="h-full w-[500px] max-md:w-full"
      />
    </div>
  );
});
