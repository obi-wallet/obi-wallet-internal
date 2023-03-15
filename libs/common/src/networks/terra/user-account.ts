import { Sdk, TerraChain } from "@obi-wallet/sdk";
import * as R from "ramda";

import { fetchGatekeeperContractAddresses } from "./gatekeeper";
import { CodeIds } from "../common";

export async function fetchCodeIds({
  chainId,
  address,
}: {
  chainId: TerraChain;
  address: string;
}) {
  const addresses = {
    userAccount: address,
    ...(await fetchGatekeeperContractAddresses({
      proxyAddress: address,
      chainId,
    })),
  };

  const pairs = R.toPairs(addresses);
  const pairsWithCodeIds = await Promise.all(
    pairs.map(async ([key, address]) => {
      return [
        key,
        address
          ? await Sdk.chainId(chainId).fetchCodeId({ contract: address })
          : null,
      ] as [string, number | null];
    })
  );
  return R.fromPairs(pairsWithCodeIds) as unknown as CodeIds;
}
