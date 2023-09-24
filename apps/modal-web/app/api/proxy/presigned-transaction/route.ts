import {
    SecretJsClient,
    secretJsChains,
  } from "@obi-wallet/sdk";
  import { getFeeLender } from "apps/modal-web/src/fee-lender";
  import { NextResponse } from "next/server";
  import { MsgExecuteContract, TxResultCode } from "secretjs";
  import invariant from "tiny-invariant";
  
  /// Calls first_update_owner to update the pre-created account's owner to
  /// the user's multisig key
  export async function POST(request: Request) {
    const body: {
      message: MsgExecuteContract<any>;
      userEntryAddress: string;
      userEntryCodeHash: string;
      nexthashSignedBySigners: string[]; //hex
    } = await request.json();
  
    const chainId = "secret-4";
    const client = new SecretJsClient(chainId);
    const chain = secretJsChains[chainId];

    const { wallet, signer, lenderIndex } = getFeeLender(
      chainId,
    );
  
    console.log("sending MsgExecuteContract...");
    invariant(wallet.address, "no fee lender wallet address");
    const msgWithSignatures = {
        ...body.message.msg,
        signatures: body.messageSignedBySigners
    }
    const messageToSign = {
        ...body.message,
        msg: msgWithSignatures
    }
    const signedTransaction = await client.createAndSignTransaction({
        signer,
        messages: [messageToSign],
      });
      // fire and forget
    const txResult = await client.broadcastSignedTransaction(
        signedTransaction,
    );
    return NextResponse.json({
        success: txResult.success,
        error: txResult.transactionHash
    });
  }
  