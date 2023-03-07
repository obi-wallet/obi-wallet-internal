import { TerraChain } from "../../chains";
import { withLcdClient } from "../../clients";

export async function fetchCodeId({
  chainId,
  address,
}: {
  chainId: TerraChain;
  address: string;
}) {
  return await withLcdClient(chainId, async (client) => {
    const response = await client.wasm.contractInfo(address);
    return response.code_id;
  });
}
