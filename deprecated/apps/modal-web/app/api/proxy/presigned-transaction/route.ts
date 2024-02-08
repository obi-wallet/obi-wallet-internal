import { SecretJsChainId, SecretJsClient } from "@obi-wallet/sdk";
import { getFeeLender } from "apps/modal-web/src/fee-lender";
import { NextResponse } from "next/server";
import { MsgExecuteContract } from "secretjs";
import invariant from "tiny-invariant";

export interface PresignedTransactionRequestBody<M extends object> {
  message: MsgExecuteContract<M>;
  userAccountAddress: string;
  userAccountCodeHash: string;
}
/// Calls first_update_owner to update the pre-created account's owner to
/// the user's multisig key
export async function POST(request: Request) {
  const body: PresignedTransactionRequestBody<object> = await request.json();

  const chainId: SecretJsChainId = "secret-4";
  const client = new SecretJsClient(chainId);

  const { wallet, signer, lenderIndex } = getFeeLender(chainId);
  // available to send back if for some reason a follow up
  // tx must be submitted by same party
  const _lenderIndex = lenderIndex;

  console.log("sending MsgExecuteContract...");
  invariant(wallet.address, "no fee lender wallet address");
  const messageToSign = new MsgExecuteContract({
    sender: wallet.address,
    code_hash: body.userAccountCodeHash,
    contract_address: body.userAccountAddress,
    msg: body.message.msg,
    sent_funds: [],
  });
  console.log("messageToSign is " + JSON.stringify(messageToSign));
  const signedTransaction = await client.createAndSignTransaction({
    signer,
    messages: [messageToSign],
  });
  console.log("transaction signed!");
  // fire and forget
  const txResult = await client.broadcastSignedTransaction(signedTransaction);
  return NextResponse.json({
    success: txResult.success,
    hash: txResult.transactionHash,
  });
}
