import {
  Chain,
  cosmos,
  isCosmosChain,
  isTerraChain,
  terra,
} from "@obi-wallet/common";

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

      if (isTerraChain(chainId)) {
        return await terra.fetchBalances({ address, chainId });
      }

      if (isCosmosChain(chainId)) {
        return await cosmos.fetchBalances({ address, chainId });
      }

      return [];
    },
  };
}

export function getPricesQuery({ chainId }: { chainId: Chain }) {
  return {
    queryKey: ["prices", { chainId }],
    queryFn: async () => {
      if (isTerraChain(chainId)) {
        return await terra.fetchPrices({ chainId });
      }

      if (isCosmosChain(chainId)) {
        return await cosmos.fetchPrices({ chainId });
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
    staleTime: 1000 * 60 * 60 * 24, // 1 day
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
      if (!address) return undefined;

      if (isTerraChain(chainId)) {
        return await terra.fetchRewards({ address, chainId });
      }

      return undefined;
    },
  };
}
