import { terra } from "@obi-wallet/common";
import { Chain, Sdk } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

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
      return await Sdk.chainId(chainId).fetchGatekeeperContractAddresses({
        proxyAddress: address,
      });
    },
  };
}

export function getPermissionedAddressesQuery({
  chainId,
  spendLimitGatekeeper,
}: {
  chainId: Chain;
  spendLimitGatekeeper: string | null | undefined;
}) {
  return {
    queryKey: ["gatekeeper", { chainId, spendLimitGatekeeper }],
    queryFn: async () => {
      return Chain.select({
        chainId,
        async onTerraChain(chainId) {
          invariant(spendLimitGatekeeper, "spendLimitGatekeeper is required");
          return await terra.fetchPermissionedAddresses({
            spendLimitGatekeeper,
            chainId,
          });
        },
        async onCosmosChain() {
          // TODO: not implemented yet
          return [];
        },
      });
    },
    enabled: !!spendLimitGatekeeper,
  };
}
