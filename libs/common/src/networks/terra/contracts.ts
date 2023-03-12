import { TerraChain, withTerraClient } from "@obi-wallet/sdk";

export async function fetchCodeId({
  chainId,
  address,
}: {
  chainId: TerraChain;
  address: string;
}) {
  return await withTerraClient(chainId, async (client) => {
    const response = await client.wasm.contractInfo(address);
    return response.code_id;
  });
}
