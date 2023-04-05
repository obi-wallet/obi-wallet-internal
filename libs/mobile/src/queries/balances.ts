import { Chain, Sdk } from "@obi-wallet/sdk";

import { staleTime } from "./helpers";

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
      return await Sdk.chainId(chainId).fetchRewards({ address });
    },
  };
}
