import { useStore } from "@/contexts";
import { SimulationEntry } from "@/dashboard/schema";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { TokenConfig, TokensConfig } from "@/stores/tokens";
import { TargetChain, TargetChainId } from "@/target-chain";
import { useQuery } from "@obi-wallet/headless-ui";
import { AssetInfo, Caip19Asset } from "@obi-wallet/sdk-abstract-target-chain";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { flatten, toPairs } from "ramda";
import invariant from "tiny-invariant";
import { z } from "zod";

import { usePublicKey } from "../use-public-key";

export interface PrettyCaip19Asset extends Caip19Asset {
  price: string;
  usdBalance: string;
  prettyAmount: string;
  assetInfo: AssetInfo | null;
}

async function fetchBalances({
  address,
  targetChainId,
  tokensConfig,
}: {
  address?: string;
  targetChainId: TargetChainId;
  tokensConfig: TokensConfig;
}): Promise<PrettyCaip19Asset[]> {
  if (!address) {
    return [];
  }

  const targetChain = TargetChain.chainId(targetChainId);
  const balances = await targetChain.nativeBalances(address);

  const tokens = toPairs(tokensConfig).filter(([id, config]) => {
    return config?.enabled && targetChain.isTokenAsset(id);
  });

  const handleBalance = async ({
    id,
    tokenConfig,
    rawAmount,
  }: {
    id: Caip19AssetId;
    tokenConfig?: TokenConfig;
    rawAmount: string;
  }) => {
    if (!tokenConfig?.enabled) return [];

    const price = (await targetChain.price(id)).usdValue;
    const defaultAssetInfo = await targetChain.assetInfo(id);
    const assetInfo = tokenConfig.assetInfo ?? defaultAssetInfo ?? null;

    const amount = new BigNumber(rawAmount).dividedBy(
      10 ** (assetInfo?.decimals ?? 0),
    );

    const priceBn = new BigNumber(price);
    const usdBalance = priceBn.times(amount);

    return [
      {
        assetId: id,
        rawAmount,
        price,
        usdBalance: usdBalance.toString(),
        prettyAmount: amount.toString(),
        assetInfo: assetInfo
          ? {
              ...assetInfo,
              image: assetInfo?.image ?? defaultAssetInfo?.image ?? null,
            }
          : null,
      },
    ];
  };

  return flatten([
    ...(await Promise.all(
      balances.map(async (asset): Promise<PrettyCaip19Asset[]> => {
        const defaultAssetInfo = await targetChain.assetInfo(asset.assetId);
        const tokenConfig: TokenConfig = tokensConfig[asset.assetId] ?? {
          enabled: true,
          assetInfo: defaultAssetInfo ?? undefined,
        };
        return await handleBalance({
          id: asset.assetId,
          tokenConfig,
          rawAmount: asset.rawAmount,
        });
      }),
    )),
    ...(await Promise.all(
      tokens.map(async ([id, tokenConfig]): Promise<PrettyCaip19Asset[]> => {
        const rawAmount = await targetChain.tokenBalance({
          address,
          assetId: id,
        });
        return await handleBalance({
          id,
          tokenConfig,
          rawAmount,
        });
      }),
    )),
  ]);
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
  const { targetChainsStore, tokensStore } = useStore();
  const publicKey = usePublicKey();

  return useQueries({
    queries: getQueries(),
  });

  function getQueries() {
    if (!wallet || !publicKey) return [];

    const targetChains = targetChainsStore.getTargetChains(
      wallet.userEntryAddress,
    );
    const tokensConfig = tokensStore.getTokensConfig(wallet.userEntryAddress);

    return targetChains.map((chain) => {
      return {
        queryKey: ["balances", chain.id, publicKey],
        queryFn: async (): Promise<PrettyCaip19Asset[]> => {
          invariant(publicKey, "Expected publicKey to be set.");
          if (!chain.enabled) {
            return [];
          }
          return await fetchBalances({
            address: await chain.targetChain.obiAccountAddress(publicKey),
            targetChainId: chain.id,
            tokensConfig,
          });
        },
      };
    });
  }
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
