import { getFeeLender } from "@/lib/fee-lender";
import { HexEncodedString } from "@obi-wallet/encoding";
import {
  HomeChainIdSchema,
  Messages,
  MultisigKey,
  SecretJsClient,
} from "@obi-wallet/sdk";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { z } from "zod";

const schema = z.object({
  homeChainId: HomeChainIdSchema,
  newOwner: MultisigKey.schema.migratableSchema,
  userAccountAddress: z.string(),
  userAccountCodeHash: z.string(),
  signatures: z.array(HexEncodedString),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const {
    homeChainId,
    userAccountAddress,
    userAccountCodeHash,
    newOwner,
    signatures,
  } = result.data;

  const client = new SecretJsClient(homeChainId);
  const messagesSdk = Messages.chainId(homeChainId);

  const { wallet, signer } = getFeeLender(homeChainId);
  invariant(wallet.address, "no fee lender wallet address");

  const message = messagesSdk.getProposeUpdateOwnerMessage(
    MultisigKey.create(homeChainId, newOwner),
    userAccountAddress,
    userAccountCodeHash,
    wallet.address,
    signatures,
  );

  const signedTransaction = await client.createAndSignTransaction({
    signer,
    messages: [message],
  });
  const broadcastTransactionResult =
    await client.broadcastSignedTransaction(signedTransaction);
  console.log(broadcastTransactionResult);

  return NextResponse.json({
    success: broadcastTransactionResult.success,
  });
}
