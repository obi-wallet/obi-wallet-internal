import { RootStore } from "@obi-wallet/headless-ui";
import { QueryClientNamespace, Token } from "@obi-wallet/sdk";
import { toJS } from "mobx";
import invariant from "tiny-invariant";

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
      const evmAddress =
        rootStore.walletsStore.currentWallet?.evmUserContractAddress;
      invariant(evmAddress, "evm address not set");
      console.log({ ethAccount: toJS(evmAddress) });
      const response = await fetch(`/api/ethereum-demo/balances/${evmAddress}`);
      return await response.json();
    },
    params: address,
  });
}
