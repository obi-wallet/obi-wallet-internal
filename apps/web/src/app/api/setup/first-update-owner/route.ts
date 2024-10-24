import { getFeeLender } from "@/lib/fee-lender";
import { setWalletData } from "@/wallet-data-backup/worker-client";
import {
  HomeChainIdSchema,
  Messages,
  MultisigKey,
  MultisigKeySchema,
  SecretJsClient,
  WalletData,
} from "@obi-wallet/sdk";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  homeChainId: HomeChainIdSchema,
  owner: MultisigKeySchema,
  ownerAddress: z.string(),
  userAccountAddress: z.string(),
  userAccountCodeHash: z.string(),
  userEntryAddress: z.string(),
  userEntryCodeHash: z.string(),
  ownerIndex: z.number(),
  walletData: WalletData,
});

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
    walletData,
  } = result.data;

  const client = new SecretJsClient(homeChainId);
  const messagesSdk = Messages.chainId(homeChainId);

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

  if (broadcastTransactionResult.success) {
    const response = await setWalletData(walletData);
    if (response.status !== 200) {
      return NextResponse.json(
        {
          success: false,
        },
        {
          status: response.status,
        },
      );
    }
  }

  return NextResponse.json({
    success: broadcastTransactionResult.success,
  });
}
