import { Secp256k1PrivateKeySigner, SecretJsClient } from "@obi-wallet/sdk";
import { NextResponse } from "next/server";
import { MsgSend, Wallet } from "secretjs";
import invariant from "tiny-invariant";

export async function POST(request: Request) {
  try {
    const body: {
      homeChainId: "secret-4";
      address: string;
    } = await request.json();
    console.log("lend request received");
    const feeLender = process.env.FEE_LENDER_SECRET_4 ?? "";
    invariant(feeLender, "fee lender not set");
    const feeLenderIndex = Math.floor(Math.random() * 1000);
    const wallet = new Wallet(feeLender, {
      hdAccountIndex: feeLenderIndex,
    });
    const signer = new Secp256k1PrivateKeySigner(
      Buffer.from(wallet.privateKey).toString("base64"),
    );
    const client = new SecretJsClient(body.homeChainId);

    const signedTransaction = await client.createAndSignTransaction({
      signer,
      messages: [
        new MsgSend({
          to_address: body.address,
          from_address: wallet.address,
          amount: [
            {
              amount: "20000",
              denom: "uscrt",
            },
          ],
        }),
      ],
    });
    const broadcastTransactionResult = await client.broadcastSignedTransaction(
      signedTransaction,
    );
    console.log(broadcastTransactionResult);
    return NextResponse.json(broadcastTransactionResult);
  } catch (e) {
    console.log("error", e);
    return NextResponse.json(e);
  }
}
