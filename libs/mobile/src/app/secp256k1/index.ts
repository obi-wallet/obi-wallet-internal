import { Chain } from "@obi-wallet/sdk";
import { QueryClient } from "@tanstack/react-query";
import secp256k1 from "secp256k1";

import { getPrepareKeyQuery } from "../../queries/keys";

export async function prepareWalletAndSign({
  publicKey,
  privateKey,
  payload,
  chainId,
  queryClient,
}: {
  publicKey: string;
  privateKey: string;
  payload: Uint8Array;
  chainId: Chain;
  queryClient: QueryClient;
}): Promise<ReturnType<typeof secp256k1.ecdsaSign>> {
  const privateKeyUint8Array = new Uint8Array(
    Buffer.from(privateKey, "base64")
  );

  await queryClient.fetchQuery(
    getPrepareKeyQuery({
      chainId,
      publicKey,
      privateKey,
    })
  );

  return secp256k1.ecdsaSign(payload, privateKeyUint8Array);
}
