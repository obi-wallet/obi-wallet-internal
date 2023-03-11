import { CosmosChain, TerraChain } from "@obi-wallet/sdk";
import fetch from "isomorphic-unfetch";

export async function lendFees({
  chainId,
  address,
}: {
  chainId: CosmosChain | TerraChain;
  address: string;
}) {
  const response = await fetch(
    "https://fee-lender-worker.obiwallet.workers.dev/",
    {
      method: "POST",
      body: `${chainId},${address}`,
    }
  );
  if (response.status !== 200) {
    console.log(response);
    throw new Error("Lending fees failed");
  }
}
