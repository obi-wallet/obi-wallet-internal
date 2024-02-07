import { ToAsset, toAssets } from "@/app/dashboard/fast-travel/assets";
import { TargetChain, TargetChainId, TargetChains } from "@/target-chain";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { getQueryClient } from "@sei-js/core";
import { useQueries, UseQueryResult } from "@tanstack/react-query";
import invariant from "tiny-invariant";

import { usePublicKey } from "../use-public-key";

export type Coin = {
  denom: string;
  amount: string;
  price: number;
};
export type Balance = {
  balances: Coin[];
  chainId: TargetChainId;
};

export type FetchBalanceResponse = Promise<Balance>;

async function fetchBalances({
  address,
  chainId,
}: {
  address?: string;
  chainId: TargetChainId;
}): Promise<Balance> {
  if (!address)
    return Promise.resolve({ balances: [] as Coin[], chainId: chainId });
  const chainData = TargetChains[chainId];
  const queryClient = await getQueryClient(chainData.rpc);

  try {
    const res = await queryClient.cosmos.bank.v1beta1.allBalances({ address });
    // Validate res.balances before using it
    if (!Array.isArray(res.balances)) {
      throw new Error(
        `Expected res.balances to be an array, got ${typeof res.balances}`,
      );
    }
    const pricesPromises = res.balances.map(
      async (balance: { denom: string; amount: string }) => {
        const price = await getTokenPrice(chainId, balance.denom);
        return {
          ...balance,
          price,
        };
      },
    );
    const balancesWithPrice = await Promise.all(pricesPromises);

    return {
      balances: balancesWithPrice.flat() as Coin[],
      chainId,
    };
  } catch (e) {
    console.error("Fetching balances error", e);
    throw new Error("Failed to fetch balances");
  }
}

export function useBalances({
  publicKey,
}: {
  publicKey: Secp256k1PublicKey | undefined;
}): UseQueryResult<Balance, unknown>[] {
  // get an array of all the chain ids from TargetChainId
  const chains = Object.values(TargetChainId);

  // useQueries to fetch balances for each chain
  return useQueries({
    queries: chains.map((chainId) => ({
      queryKey: ["balances", publicKey, chainId],
      enabled: !!publicKey, // Only run query if address is provided
      queryFn: (): Promise<Balance> => {
        invariant(publicKey, "Expected publicKey to be set.");
        const chain = TargetChains[chainId];
        if (chain.disabled) {
          return Promise.resolve({ balances: [], chainId } as Balance);
        }
        return fetchBalances({
          address: TargetChain.chainId(chainId).computeAddress(publicKey),
          chainId,
        });
      },
    })),
  });
}

const getTokenPrice = async (chainId: string, denom: string) => {
  const url = `https://api.0xsquid.com/v1/token-price?chainId=${chainId}&tokenAddress=${denom}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.price;
};

export function useUSDTotalPrice(): {
  total: number;
  loading: boolean;
} {
  const publicKey = usePublicKey();
  const balances = useBalances({ publicKey });
  // if (publicKey === undefined) return { total: 0, loading: false };

  // if all balances are not loaded, return 0
  if (balances.every((balance) => balance.status === "loading")) {
    return {
      total: 0,
      loading: true,
    };
  }

  const filteredSuccessBalances = balances.filter(
    (bal) => bal.status === "success",
  );
  const flatBalances = filteredSuccessBalances
    .map((balance) => balance.data?.balances)
    .flat();

  const total = flatBalances
    .reduce((acc, balance) => {
      const price = balance?.price as number;

      const asset = toAssets[
        Object.keys(toAssets).find(
          (key) => toAssets[key]?.denom === balance?.denom,
        ) ?? ""
      ] as ToAsset;
      const amount = Number(balance?.amount);
      const decimals = asset?.decimals ?? 0;
      // get amount using the asset's decimals
      const decimalAmount = amount / Math.pow(10, decimals);
      return acc + price * decimalAmount;
    }, 0)
    .toFixed(2) as unknown as number;

  return {
    total,
    loading: false,
  };
}
