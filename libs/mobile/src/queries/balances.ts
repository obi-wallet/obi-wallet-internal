import {
  Chain,
  cosmos,
  isCosmosChain,
  isTerraChain,
  terra,
} from "@obi-wallet/common";

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

      if (isCosmosChain(chainId)) {
        return await cosmos.fetchBalances({ address, chainId });
      }

      if (isTerraChain(chainId)) {
        return await terra.fetchBalances({ address, chainId });
      }

      return [];
    },
  };
}

export function getPricesQuery({ chainId }: { chainId: Chain }) {
  return {
    queryKey: ["prices", { chainId }],
    queryFn: async () => {
      if (isCosmosChain(chainId)) {
        return await cosmos.fetchPrices({ chainId });
      }

      if (isTerraChain(chainId)) {
        return await terra.fetchPrices({ chainId });
      }

      return {};
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

      if (isTerraChain(chainId)) {
        return await terra.fetchDelegations({ address, chainId });
      }

      return [];
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

      if (isTerraChain(chainId)) {
        return await terra.fetchUnbondingDelegations({ address, chainId });
      }

      return [];
    },
  };
}

export function getValidatorsQuery({ chainId }: { chainId: Chain }) {
  return {
    queryKey: ["validators", { chainId }],
    queryFn: async () => {
      if (isTerraChain(chainId)) {
        return await terra.fetchValidators({ chainId });
      }

      return [];
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
