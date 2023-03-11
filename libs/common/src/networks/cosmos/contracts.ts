import { CosmosChain } from "@obi-wallet/sdk";

import { createCosmWasmClient } from "../../clients";

export async function fetchCodeId({
  chainId,
  address,
}: {
  chainId: CosmosChain;
  address: string;
}) {
  const wasmClient = await createCosmWasmClient(chainId);
  const contract = await wasmClient.getContract(address);
  wasmClient.disconnect();
  return contract.codeId;
}
