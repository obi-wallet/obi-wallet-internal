import { ChainId, Rewards, Sdk } from "@obi-wallet/sdk";

import { useQuery } from "./query";
import { useCurrentWallet } from "../provider";

export function useDelegations() {
  const wallet = useCurrentWallet();
  return useQuery(
    Sdk.chainId(wallet.chainId).staking.delegationsQuery(wallet.address)
  );
}

export function useUnbondingDelegations() {
  const wallet = useCurrentWallet();
  return useQuery(
    Sdk.chainId(wallet.chainId).staking.unbondingDelegationsQuery(
      wallet.address
    )
  );
}

export function useValidators(chainId: ChainId) {
  return useQuery(Sdk.chainId(chainId).staking.validatorsQuery());
}

export function useRewards() {
  const wallet = useCurrentWallet();
  const response = useQuery(
    Sdk.chainId(wallet.chainId).staking.rewardsQuery(wallet.address)
  );
  const fallback: Rewards = {
    perDelegator: [],
    total: { id: wallet.chain.denom, amount: "0" },
  };
  return {
    ...response,
    data: response.data ?? fallback,
  };
}
