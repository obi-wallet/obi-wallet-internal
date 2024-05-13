import { toAssets } from "@/dashboard/assets";
import { SimulationEntry } from "@/dashboard/schema";
import { TargetChain, TargetChainId } from "@/target-chain";
import { CosmosSdkChains } from "@/target-chain/cosmos-sdk/chains";
import { useQuery } from "@obi-wallet/headless-ui";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { toPairs } from "ramda";
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

  return await TargetChain.chainId(targetChainId).withStargateClient(
    async (client) => {
      const coins = await client.getAllBalances(address);
      const balances = await Promise.all(
        coins.map(async (balance) => {
          const price = await getTokenPrice(targetChainId, balance.denom);
          return {
            targetChainId,
            denom: balance.denom,
            amount: balance.amount,
            price: price.toString(),
          };
        }),
      );
      return {
        balances,
        targetChainId,
      };
    },
  );
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

  return await TargetChain.chainId(chainId).withStargateClient(
    async (client) => {
      const coins = await client.getAllBalances(address);
      const balances = await Promise.all(
        coins.map(async (balance) => {
          const price = await getTokenPrice(chainId, balance.denom);
          return {
            ...balance,
            price,
          };
        }),
      );
      return {
        balances,
        chainId,
      };
    },
  );
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
  const chains = Object.values(CosmosSdkChains);

  // useQueries to fetch balances for each chain
  return useQueries({
    queries: chains.map((chain) => {
      return {
        queryKey: ["new-balances", chain.id, publicKey],
        enabled: !!publicKey, // Only run query if address is provided
        queryFn: async (): Promise<NewBalance> => {
          invariant(publicKey, "Expected publicKey to be set.");
          if (chain.disabled) {
            return {
              balances: [],
              targetChainId: chain.id,
            };
          }
          return await fetchNewBalances({
            address: TargetChain.chainId(chain.id).computeAddress(publicKey),
            targetChainId: chain.id,
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
  // get an array of all the chain ids from TargetChainId
  const chains = Object.values(CosmosSdkChains);

  // useQueries to fetch balances for each chain
  return useQueries({
    queries: chains.map((chain) => {
      return {
        queryKey: ["balances", chain.id, publicKey],
        enabled: !!publicKey, // Only run query if address is provided
        queryFn: async (): Promise<Balance> => {
          invariant(publicKey, "Expected publicKey to be set.");
          if (chain.disabled) {
            return {
              balances: [],
              chainId: chain.id,
            };
          }
          return await fetchBalances({
            address: TargetChain.chainId(chain.id).computeAddress(publicKey),
            chainId: chain.id,
          });
        },
      };
    }),
  });
}

export const getTokenPrice = async (
  chainId: string,
  denom: string,
): Promise<number> => {
  if (chainId === "neutron-1" && denom !== "untrn") {
    const url = "https://api.skip.money/v2/fungible/route";

    const toAsset = toPairs(toAssets).find(([_, value]) => {
      return value.denom === denom;
    });

    // amount_in should be 1 considering the decimals of the token for example 1 * 10^6 for STARS
    const amount_in = BigNumber(1).multipliedBy(
      BigNumber(10).pow(toAsset?.[1].decimals ?? 0),
    );
    const data = {
      source_asset_chain_id: "neutron-1",
      amount_in: amount_in.toString(),
      source_asset_denom: denom,
      dest_asset_denom:
        "ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
      dest_asset_chain_id: "neutron-1",
      allow_unsafe: true,
    };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      return Number(json.usd_amount_out);
    } catch (e) {
      console.log("SKIP ERROR", e);
    }
  }

  const url = `https://api.0xsquid.com/v1/token-price?chainId=${chainId}&tokenAddress=${denom}`;
  const res = await fetch(url);
  if (res.status !== 200) {
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const json = (await res.json()) as { price: number };

  return json.price;
};

export function useUSDTotalPrice(): {
  total: string;
  loading: boolean;
} {
  const publicKey = usePublicKey();
  const balances = useBalances({ publicKey });
  // if (publicKey === undefined) return { total: 0, loading: false };

  // if all balances are not loaded, return 0
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
      return balance.data?.balances;
    })
    .filter((balance): balance is Coin[] => {
      return balance !== undefined;
    })
    .flat();

  const total = flatBalances
    .reduce((acc, balance) => {
      const price = balance.price;

      const asset =
        toAssets[
          Object.keys(toAssets).find((key) => {
            return toAssets[key]?.denom === balance?.denom;
          }) ?? ""
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
