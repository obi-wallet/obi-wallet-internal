import { QueryClientNamespace, Token } from "@obi-wallet/sdk";

const queryNamespace = new QueryClientNamespace("ethereum-demo", {});

export function ethereumBalancesQuery(account: { address: string } | null) {
  return queryNamespace.createQuery({
    name: "balances",
    fn: async (address?: string): Promise<Token[]> => {
      if (!address) return [];
      const response = await fetch(`/api/ethereum-demo/balances/${address}`);
      return await response.json();
    },
    params: account?.address,
  });
}
