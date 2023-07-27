import { RootStore } from "@obi-wallet/headless-ui";
import { QueryClientNamespace, Token } from "@obi-wallet/sdk";
import { toJS } from "mobx";

const queryNamespace = new QueryClientNamespace("ethereum-demo", {});

export function ethereumBalancesQuery({
  address,
  rootStore,
}: {
  address: string;
  rootStore: RootStore;
}) {
  return queryNamespace.createQuery({
    name: "balances",
    fn: async (address?: string): Promise<Token[]> => {
      if (!address) return [];
      const ethAccount = await rootStore.ethereumDemoStore.getEthereumAccount();
      console.log({ ethAccount: toJS(ethAccount) });
      const response = await fetch(
        `/api/ethereum-demo/balances/${ethAccount.address}`,
      );
      return await response.json();
    },
    params: address,
  });
}
