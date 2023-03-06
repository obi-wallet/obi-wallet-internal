import { TerraChain } from "../../chains";
import { withLcdClient } from "../../clients";

export async function fetchGatekeeperContractAddresses({
  proxyAddress,
  chainId,
}: {
  proxyAddress: string;
  chainId: TerraChain;
}) {
  return await withLcdClient(chainId, async (client) => {
    const response = await client.wasm.contractQuery<{
      spendlimit_gatekeeper_contract_addr: string | null;
    }>(proxyAddress, {
      gatekeeper_contracts: {},
    });

    return {
      spendLimitGatekeeper: response.spendlimit_gatekeeper_contract_addr,
    };
  });
}
