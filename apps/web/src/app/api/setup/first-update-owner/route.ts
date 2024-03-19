import { getFeeLender } from "@/lib/fee-lender";
import {
  HomeChainIdSchema,
  Messages,
  MultisigKey,
  SecretJsClient,
} from "@obi-wallet/sdk";
import { NextResponse } from "next/server";
import { MsgSend } from "secretjs";
import invariant from "tiny-invariant";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  homeChainId: HomeChainIdSchema,
  owner: MultisigKey.schema.migratableSchema,
  ownerAddress: z.string(),
  userAccountAddress: z.string(),
  userAccountCodeHash: z.string(),
  userEntryAddress: z.string(),
  userEntryCodeHash: z.string(),
  ownerIndex: z.number(),
});

export interface UserAccountAddress {
  user_account_address: string;
  user_account_code_hash: string;
}

/// Calls first_update_owner to update the pre-created account's owner to
/// the user's multisig key
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
    owner,
    ownerAddress,
    userAccountAddress,
    userAccountCodeHash,
    userEntryAddress,
    userEntryCodeHash,
    ownerIndex,
  } = result.data;

  const client = new SecretJsClient(homeChainId);
  const messagesSdk = Messages.chainId(homeChainId);
  const lender1 = getFeeLender(homeChainId);
  const sendMessage = new MsgSend({
    from_address: lender1.wallet.address,
    to_address: ownerAddress,
    amount: [
      {
        amount: "100",
        denom: "uscrt",
      },
    ],
  });
  const lendSignedTransaction = await client.createAndSignTransaction({
    signer: lender1.signer,
    messages: [sendMessage],
  });
  // fire and forget
  const _lendBroadcastTransactionResult = client.broadcastSignedTransaction(
    lendSignedTransaction,
  );

  // old lender from before, which is the only account capable of
  // updating owner, even with "magic" first_update_owner
  const { wallet, signer } = getFeeLender(homeChainId, ownerIndex);
  invariant(wallet.address, "no fee lender wallet address");

  const legacyOwner: { legacy_owner: string } =
    await client.withSecretNetworkClient(async (client) => {
      return await client.query.compute.queryContract({
        contract_address: userAccountAddress,
        code_hash: userAccountCodeHash,
        query: { legacy_owner: {} },
      });
    });

  // Make this request idempotent by checking if the owner has already been set
  if (legacyOwner.legacy_owner === ownerAddress) {
    return NextResponse.json({
      success: true,
    });
  }

  const message = messagesSdk.getFirstUpdateWalletMessage(
    MultisigKey.create(homeChainId, owner),
    ownerAddress,
    userEntryAddress,
    userEntryCodeHash,
    wallet.address,
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
