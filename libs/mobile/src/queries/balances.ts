import { terra } from "@obi-wallet/common";
import { Chain, isTerraChain, Sdk } from "@obi-wallet/sdk";

import { staleTime } from "./helpers";

export function getBalancesQuery({
  chainId,
  address,
}: {
  chainId: Chain;
  address: string | null;
}) {
  return {
    queryKey: ["balances", { chainId, address }],
    queryFn: async () => {
      if (!address) return [];
      return await Sdk.chainId(chainId).fetchBalances({ address });
    },
  };
}

export function getPricesQuery({ chainId }: { chainId: Chain }) {
  return {
    queryKey: ["prices", { chainId }],
    queryFn: async () => {
      return await Sdk.chainId(chainId).fetchPrices();
    },
  };
}

export function getDelegationsQuery({
  chainId,
  address,
}: {
  chainId: Chain;
  address: string | null;
}) {
  return {
    queryKey: ["delegations", { chainId, address }],
    queryFn: async () => {
      if (!address) return [];
      return await Sdk.chainId(chainId).fetchDelegations({ address });
    },
  };
}

export function getUnbondingDelegations({
  chainId,
  address,
}: {
  chainId: Chain;
  address: string | null;
}) {
  return {
    queryKey: ["unbonding-delegations", { chainId, address }],
    queryFn: async () => {
      if (!address) return [];
      return await Sdk.chainId(chainId).fetchUnbondingDelegations({ address });
    },
  };
}

export function getValidatorsQuery({ chainId }: { chainId: Chain }) {
  return {
    queryKey: ["validators", { chainId }],
    queryFn: async () => {
      return await Sdk.chainId(chainId).fetchValidators();
    },
    staleTime: staleTime({ days: 1 }),
  };
}

export function getRewardsQuery({
  chainId,
  address,
}: {
  chainId: Chain;
  address: string | null;
}) {
  return {
    queryKey: ["rewards", { chainId, address }],
    queryFn: async () => {
      if (!address) return null;

      if (isTerraChain(chainId)) {
        return await terra.fetchRewards({ address, chainId });
      }

      return null;
    },
  };
}
