import * as R from "ramda";

import { fetchCodeId } from "./contracts";
import { fetchGatekeeperContractAddresses } from "./gatekeeper";
import { TerraChain } from "../../chains";

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
        address ? await fetchCodeId({ chainId, address }) : null,
      ] as [string, number | null];
    })
  );
  return R.fromPairs(pairsWithCodeIds) as {
    userAccount: number;
    spendLimitGatekeeper: number | null;
  };
}
