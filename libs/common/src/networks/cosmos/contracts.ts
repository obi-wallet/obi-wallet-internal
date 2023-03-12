import { CosmosChain, withCosmosCosmWasmClient } from "@obi-wallet/sdk";

export async function fetchCodeId({
  chainId,
  address,
}: {
  chainId: CosmosChain;
  address: string;
}) {
  return await withCosmosCosmWasmClient(chainId, async (client) => {
    const contract = await client.getContract(address);
    return contract.codeId;
  });
}
