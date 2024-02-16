import { toAssets } from "@/app/dashboard/fast-travel/assets";
import { TargetChain, TargetChainId } from "@/target-chain";
import { CosmosSdkChains } from "@/target-chain/cosmos-sdk/chains";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import {
  useQueries,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
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
  if (!address) {
    return Promise.resolve({ balances: [] as Coin[], chainId: chainId });
  }
  return await TargetChain.chainId(chainId).withStargateClient(
    async (client) => {
      const balances = await client.getAllBalances(address);
      const pricesPromises = balances.map(async (balance) => {
        const price = await getTokenPrice(chainId, balance.denom);
        return {
          ...balance,
          price,
        };
      });
      const balancesWithPrice = await Promise.all(pricesPromises);
      return {
        balances: balancesWithPrice.flat() as Coin[],
        chainId,
      };
    },
  );
}

export function useInvalidateBalancesQueries() {
  const queryClient = useQueryClient();
  return async (chainId: TargetChainId) => {
    await queryClient.invalidateQueries(["balances", chainId]);
  };
}

export function useBalances({
  publicKey,
}: {
  publicKey: Secp256k1PublicKey | undefined;
}): UseQueryResult<Balance, unknown>[] {
  // get an array of all the chain ids from TargetChainId
  const chains = Object.values(CosmosSdkChains);

  // useQueries to fetch balances for each chain
  return useQueries({
    queries: chains.map((chain) => ({
      queryKey: ["balances", chain.id, publicKey],
      enabled: !!publicKey, // Only run query if address is provided
      queryFn: (): Promise<Balance> => {
        invariant(publicKey, "Expected publicKey to be set.");
        if (chain.disabled) {
          return Promise.resolve({
            balances: [],
            chainId: chain.id,
          } as Balance);
        }
        return fetchBalances({
          address: TargetChain.chainId(chain.id).computeAddress(publicKey),
          chainId: chain.id,
        });
      },
    })),
  });
}

const getTokenPrice = async (
  chainId: string,
  denom: string,
): Promise<number> => {
  const url = `https://api.0xsquid.com/v1/token-price?chainId=${chainId}&tokenAddress=${denom}`;
  const res = await fetch(url);

  if (res.status !== 200) {
    return 0;
  }

  const json = (await res.json()) as { price: number };
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

      const asset =
        toAssets[
          Object.keys(toAssets).find(
            (key) => toAssets[key]?.denom === balance?.denom,
          ) ?? ""
        ];
      if (!asset) {
        return acc;
      }
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
