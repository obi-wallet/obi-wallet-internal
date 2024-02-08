import { getFeeLender } from "@/lib/fee-lender";
import { decompressPoint } from "@/lib/utils";
import {
  HomeChainIdSchema,
  NetworkShare,
  SecretJsClient,
  SecretJsHomeChains,
} from "@obi-wallet/sdk";
import { MsgExecuteContract } from "secretjs";
import { z } from "zod";

const schema = z.object({
  homeChainId: HomeChainIdSchema,
  networkParticipants: z.array(z.number()),
  networkShare: NetworkShare,
  userEntryAddress: z.string(),
  userEntryCodeHash: z.string(),
  ownerIndex: z.number(),
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
    networkParticipants,
    networkShare,
    userEntryAddress,
    userEntryCodeHash,
    ownerIndex,
  } = result.data;

  const chain = SecretJsHomeChains[homeChainId];

  const client = new SecretJsClient(homeChainId);
  const { wallet, signer } = getFeeLender(homeChainId, ownerIndex);

  const setSharesMessage = new MsgExecuteContract({
    sender: wallet.address,
    contract_address: chain.secretSigner.address,
    msg: {
      set_shares: {
        participants_to_completed_offline_stages: [
          {
            participants: networkParticipants,
            completed_offline_stage: {
              k_i: networkShare.sign_keys.k_i.scalar,
              R: decompressPoint(networkShare.R.point),
              sigma_i: networkShare.sigma_i.scalar,
              pubkey: decompressPoint(networkShare.local_key.y_sum_s.point),
              user_entry_code_hash: userEntryCodeHash,
            },
          },
        ],
        user_entry_address: userEntryAddress,
      },
    },
    code_hash: chain.secretSigner.codeHash,
  });
  const signedTransaction = await client.createAndSignTransaction({
    signer,
    messages: [setSharesMessage],
  });
  const broadcastTransactionResult =
    await client.broadcastSignedTransaction(signedTransaction);
  console.warn(JSON.stringify(broadcastTransactionResult));

  if (!broadcastTransactionResult.success) {
    return new Response("TX failed", {
      status: 500,
    });
  }

  return Response.json({
    success: true,
  });
}
