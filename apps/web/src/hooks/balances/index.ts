import { SimulationEntry } from "@/dashboard/schema";
import { allTargetChainIds, TargetChain, TargetChainId } from "@/target-chain";
import { useQuery } from "@obi-wallet/headless-ui";
import { Asset } from "@obi-wallet/sdk-abstract-target-chain";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import invariant from "tiny-invariant";
import { z } from "zod";

import { usePublicKey } from "../use-public-key";

export interface AssetWithPrice extends Asset<TargetChainId> {
  price: string;
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

export function useInvalidateBalancesQueries() {
  const queryClient = useQueryClient();
  return async (chainId: TargetChainId) => {
    await queryClient.invalidateQueries({ queryKey: ["balances", chainId] });
  };
}

export function useBalances() {
  const publicKey = usePublicKey();
  const queries = useQueries({
    queries: publicKey
      ? allTargetChainIds.map((targetChainId) => {
          return {
            queryKey: ["balances", targetChainId, publicKey],
            queryFn: async (): Promise<AssetWithPrice[]> => {
              invariant(publicKey, "Expected publicKey to be set.");
              const targetChain = TargetChain.chainId(targetChainId);
              if (targetChain.disabled) {
                return [];
              }
              return await fetchBalances({
                address: await targetChain.obiAccountAddress(publicKey),
                targetChainId,
              });
            },
          };
        })
      : [],
  });

  return queries.filter((query) => {
    return query.data && query.data.length > 0;
  });
}

export function useUsdTotalValue(): {
  total: string;
  loading: boolean;
} {
  const balances = useBalances();

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
    .filter((balance): balance is AssetWithPrice[] => {
      return !!balance;
    })
    .flat();

  const total = flatBalances
    .reduce((acc, balance) => {
      const targetChain = TargetChain.chainId(balance.chainId);
      const asset = targetChain.assetInfo(balance.assetId);

      if (!asset) {
        return acc;
      }
      const amount = new BigNumber(balance.rawAmount);
      const decimalAmount = amount.dividedBy(10 ** asset.decimals);
      const price = new BigNumber(balance.price);
      return acc.plus(price.times(decimalAmount));
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
