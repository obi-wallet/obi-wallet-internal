import { Secp256k1PublicKey, SecretJsChainId } from "@obi-wallet/sdk";
import { NextResponse } from "next/server";

import { recoverOrCreateEthereumAccount } from "../../../../src/stackup";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    publicKey: Secp256k1PublicKey;
    chainId: SecretJsChainId;
  };
  return NextResponse.json(await recoverOrCreateEthereumAccount(body));
}
