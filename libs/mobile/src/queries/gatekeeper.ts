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
      invariant(spendLimitGatekeeper, "spendLimitGatekeeper is required");
      return await Sdk.chainId(chainId).fetchPermissionedAddresses({
        spendLimitGatekeeper,
      });
    },
    enabled: !!spendLimitGatekeeper,
  };
}
