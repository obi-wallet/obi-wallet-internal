import { useStore } from "@/contexts";
import { SimulationEntry } from "@/dashboard/schema";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { TargetChain, TargetChainId } from "@/target-chain";
import { useQuery } from "@obi-wallet/headless-ui";
import {
  Asset,
  AssetInfo,
  Caip19Asset,
} from "@obi-wallet/sdk-abstract-target-chain";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import invariant from "tiny-invariant";
import { z } from "zod";

import { usePublicKey } from "../use-public-key";

export interface AssetWithPrice extends Asset<TargetChainId> {
  price: string;
}

export interface PrettyCaip19Asset extends Caip19Asset {
  price: string;
  usdBalance: string;
  prettyAmount: string;
  assetInfo: AssetInfo | null;
}

async function fetchBalances({
  address,
  targetChainId,
}: {
  address?: string;
  targetChainId: TargetChainId;
}): Promise<AssetWithPrice[]> {
  if (!address) {
    return [];
  }

  const targetChain = TargetChain.chainId(targetChainId);
  const balances = await targetChain.balances(address);

  return await Promise.all(
    balances.map(async (asset): Promise<AssetWithPrice> => {
      const price = (await targetChain.price(asset.assetId)).usdValue;
      return {
        ...asset,
        price,
      };
    }),
  );
}

async function fetchNewBalances({
  address,
  targetChainId,
}: {
  address?: string;
  targetChainId: TargetChainId;
}): Promise<PrettyCaip19Asset[]> {
  if (!address) {
    return [];
  }

  const targetChain = TargetChain.chainId(targetChainId);
  const balances = await targetChain.nativeBalances(address);

  return await Promise.all(
    balances.map(async (asset): Promise<PrettyCaip19Asset> => {
      const price = (await targetChain.newPrice(asset.assetId)).usdValue;
      const assetInfo = await targetChain.newAssetInfo(asset.assetId);

      const amount = new BigNumber(asset.rawAmount).dividedBy(
        10 ** (assetInfo?.decimals ?? 0),
      );

      const priceBn = new BigNumber(price);
      const usdBalance = priceBn.times(amount);

      return {
        ...asset,
        price,
        usdBalance: usdBalance.toString(),
        prettyAmount: amount.toString(),
        assetInfo,
      };
    }),
  );
}

export function useInvalidateBalancesQueries() {
  // TODO: this probably doesn't work as expected since we need to invalidate the underlying
  // queries instead
  const queryClient = useQueryClient();
  return async (chainId: TargetChainId) => {
    await queryClient.invalidateQueries({ queryKey: ["balances", chainId] });
  };
}

export function useBalances() {
  const wallet = useCurrentWallet({});
  const { targetChainsStore } = useStore();

  const publicKey = usePublicKey();
  return useQueries({
    queries:
      wallet && publicKey
        ? targetChainsStore
            .getTargetChains(wallet.userEntryAddress)
            .map((chain) => {
              return {
                queryKey: ["balances", chain.id, publicKey],
                queryFn: async (): Promise<AssetWithPrice[]> => {
                  invariant(publicKey, "Expected publicKey to be set.");
                  if (!chain.enabled) {
                    return [];
                  }
                  return await fetchBalances({
                    address:
                      await chain.targetChain.obiAccountAddress(publicKey),
                    targetChainId: chain.id,
                  });
                },
              };
            })
        : [],
  });
}

export function useNewBalances() {
  const wallet = useCurrentWallet({});
  const { targetChainsStore } = useStore();

  const publicKey = usePublicKey();
  return useQueries({
    queries:
      wallet && publicKey
        ? targetChainsStore
            .getTargetChains(wallet.userEntryAddress)
            .map((chain) => {
              return {
                queryKey: ["newBalances", chain.id, publicKey],
                queryFn: async (): Promise<PrettyCaip19Asset[]> => {
                  invariant(publicKey, "Expected publicKey to be set.");
                  if (!chain.enabled) {
                    return [];
                  }
                  return await fetchNewBalances({
                    address:
                      await chain.targetChain.obiAccountAddress(publicKey),
                    targetChainId: chain.id,
                  });
                },
              };
            })
        : [],
  });
}

export function useUsdTotalValue(): {
  total: string;
  loading: boolean;
} {
  const balances = useNewBalances();

  if (
    balances.every((balance) => {
      return balance.isPending;
    })
  ) {
    return {
      total: (0).toFixed(2),
      loading: true,
    };
  }

  const flatBalances = balances
    .map((balance) => {
      return balance.data;
    })
    .filter((balance): balance is PrettyCaip19Asset[] => {
      return !!balance;
    })
    .flat();

  const total = flatBalances
    .reduce((acc, balance) => {
      return acc.plus(balance.usdBalance);
    }, new BigNumber(0))
    .toFixed(2);

  return {
    total,
    loading: false,
  };
}

const fetchPendingTX = async (
  pubKey: string,
): Promise<z.infer<typeof SimulationEntry>> => {
  if (!pubKey) return [];

  const url = `${
    process.env.NEXT_PUBLIC_FAST_TRAVEL_API_URL
  }/api/status/check.rs?test=false&pubkey=${encodeURIComponent(pubKey)}`;

  const res = await fetch(url);
  const data = await res.json();

  return SimulationEntry.parse(data);
};

export const usePendingTXs = (pubKey: string) => {
  return useQuery({
    queryKey: ["pending-txs", pubKey],
    queryFn: async () => {
      return await fetchPendingTX(pubKey);
    },
  });
};
