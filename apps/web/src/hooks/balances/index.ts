import { SimulationEntry } from "@/dashboard/schema";
import { allTargetChainIds, TargetChain, TargetChainId } from "@/target-chain";
import { useQuery } from "@obi-wallet/headless-ui";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { z } from "zod";

import { usePublicKey } from "../use-public-key";

export interface Coin {
  denom: string;
  amount: string;
  price: number;
}

export interface Balance {
  balances: Coin[];
  chainId: TargetChainId;
}

export interface NewCoin {
  targetChainId: TargetChainId;
  denom: string;
  amount: string;
  price: string;
}

export interface NewBalance {
  balances: NewCoin[];
  targetChainId: TargetChainId;
}

async function fetchNewBalances({
  address,
  targetChainId,
}: {
  address?: string;
  targetChainId: TargetChainId;
}): Promise<NewBalance> {
  if (!address) {
    return { balances: [], targetChainId };
  }

  const targetChain = TargetChain.chainId(targetChainId);
  const balances = await targetChain.balances(address);

  return {
    targetChainId,
    balances: await Promise.all(
      balances.map(async (asset): Promise<NewCoin> => {
        return {
          targetChainId,
          denom: asset.assetId,
          amount: asset.rawAmount,
          price: (await targetChain.price(asset.assetId)).usdValue,
        };
      }),
    ),
  };
}

async function fetchBalances({
  address,
  chainId,
}: {
  address?: string;
  chainId: TargetChainId;
}): Promise<Balance> {
  if (!address) {
    return { balances: [], chainId };
  }

  const targetChain = TargetChain.chainId(chainId);
  const balances = await targetChain.balances(address);

  return {
    chainId,
    balances: await Promise.all(
      balances.map(async (asset): Promise<Coin> => {
        return {
          denom: asset.assetId,
          amount: asset.rawAmount,
          price: parseFloat((await targetChain.price(asset.assetId)).usdValue),
        };
      }),
    ),
  };
}

export function useInvalidateBalancesQueries() {
  const queryClient = useQueryClient();
  return async (chainId: TargetChainId) => {
    await queryClient.invalidateQueries({ queryKey: ["balances", chainId] });
  };
}

export function useNewBalances({
  publicKey,
}: {
  publicKey?: Secp256k1PublicKey;
}) {
  return useQueries({
    queries: allTargetChainIds.map((targetChainId) => {
      return {
        queryKey: ["new-balances", targetChainId, publicKey],
        enabled: !!publicKey, // Only run query if address is provided
        queryFn: async (): Promise<NewBalance> => {
          invariant(publicKey, "Expected publicKey to be set.");
          const targetChain = TargetChain.chainId(targetChainId);
          if (targetChain.disabled) {
            return {
              balances: [],
              targetChainId,
            };
          }
          return await fetchNewBalances({
            address: targetChain.computeAddress(publicKey),
            targetChainId,
          });
        },
      };
    }),
  });
}

export function useBalances({
  publicKey,
}: {
  publicKey: Secp256k1PublicKey | undefined;
}) {
  return useQueries({
    queries: allTargetChainIds.map((targetChainId) => {
      return {
        queryKey: ["balances", targetChainId, publicKey],
        enabled: !!publicKey, // Only run query if address is provided
        queryFn: async (): Promise<Balance> => {
          invariant(publicKey, "Expected publicKey to be set.");
          const targetChain = TargetChain.chainId(targetChainId);
          if (targetChain.disabled) {
            return {
              balances: [],
              chainId: targetChainId,
            };
          }
          return await fetchBalances({
            address: targetChain.computeAddress(publicKey),
            chainId: targetChainId,
          });
        },
      };
    }),
  });
}

export function useUSDTotalPrice(): {
  total: string;
  loading: boolean;
} {
  const publicKey = usePublicKey();
  const balances = useBalances({ publicKey });

  if (
    balances.every((balance) => {
      return balance.isPending;
    })
  ) {
    return {
      total: "0",
      loading: true,
    };
  }

  const filteredSuccessBalances = balances.filter((bal) => {
    return bal.status === "success";
  });
  const flatBalances = filteredSuccessBalances
    .map((balance) => {
      return balance.data?.balances?.map((coin) => {
        return {
          targetChainId: balance.data.chainId,
          coin,
        };
      });
    })
    .filter(
      (balance): balance is { targetChainId: TargetChainId; coin: Coin }[] => {
        return balance !== undefined;
      },
    )
    .flat();

  const total = flatBalances
    .reduce((acc, balance) => {
      const targetChain = TargetChain.chainId(balance.targetChainId);
      const price = balance.coin.price;
      const asset = targetChain.assetInfo(balance.coin.denom);

      if (!asset) {
        return acc;
      }
      const amount = Number(balance?.coin.amount);
      const decimals = asset?.decimals ?? 0;
      // get amount using the asset's decimals
      const decimalAmount = amount / Math.pow(10, decimals);
      return acc + price * decimalAmount;
    }, 0)
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
