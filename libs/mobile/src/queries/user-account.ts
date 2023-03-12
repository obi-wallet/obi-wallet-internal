import { cosmos, terra } from "@obi-wallet/common";
import { Chain } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

import { staleTime } from "./helpers";

export function getCodeIdsQuery({
  chainId,
  address,
}: {
  chainId: Chain | null | undefined;
  address: string | null | undefined;
}) {
  return {
    queryKey: ["code-ids", { chainId, address }],
    queryFn: async () => {
      invariant(chainId, "chainId is required");
      invariant(address, "address is required");

      return Chain.select({
        chainId,
        async onTerraChain(chainId) {
          return await terra.fetchCodeIds({
            address,
            chainId,
          });
        },
        async onCosmosChain(chainId) {
          return {
            userAccount: await cosmos.fetchCodeId({
              address,
              chainId,
            }),
            // TODO: not implemented yet
            spendLimitGatekeeper: null,
            debtGatekeeper: null,
          };
        },
      });
    },
    staleTime: staleTime({ days: 1 }),
    enabled: !!chainId && !!address,
  };
}
