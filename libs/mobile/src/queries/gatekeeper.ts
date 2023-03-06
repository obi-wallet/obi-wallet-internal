import { Chain, terra } from "@obi-wallet/common";

export function getGatekeeperContractAddressesQuery({
  chainId,
  address,
}: {
  chainId: Chain;
  address: string;
}) {
  return {
    queryKey: ["gatekeeper", { chainId, address }],
    queryFn: async () => {
      return Chain.select({
        chainId,
        async onTerraChain(chainId) {
          return await terra.fetchGatekeeperContractAddresses({
            proxyAddress: address,
            chainId,
          });
        },
        async onCosmosChain() {
          // TODO: not implemented yet
          return {
            spendLimitGatekeeper: null,
          };
        },
      });
    },
  };
}
