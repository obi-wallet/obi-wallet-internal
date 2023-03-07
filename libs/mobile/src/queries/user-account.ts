import { Chain, cosmos, terra } from "@obi-wallet/common";

import { staleTime } from "./helpers";

export function getCodeIds({
  chainId,
  address,
}: {
  chainId: Chain;
  address: string;
}) {
  return {
    queryKey: ["code-ids", { chainId, address }],
    queryFn: async () => {
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
          };
        },
      });
    },
    staleTime: staleTime({ days: 1 }),
  };
}
