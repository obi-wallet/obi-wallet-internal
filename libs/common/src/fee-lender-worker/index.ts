import fetch from "isomorphic-unfetch";

import { Chain, TerraChain } from "../chains";

export async function lendFees({
  chainId,
  address,
}: {
  chainId: Chain | TerraChain;
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
