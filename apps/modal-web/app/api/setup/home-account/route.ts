import { Messages, MultisigKey, SecretJsClient } from "@obi-wallet/sdk";
import { getFeeLender } from "apps/modal-web/src/fee-lender";
import { NextResponse } from "next/server";
import { TxResponse } from "secretjs";
import invariant from "tiny-invariant";

/// Sets up a new home account for the user, owned by the specified address.
/// Returns the resulting address.
export async function POST(request: Request) {
  const body: {
    owner: MultisigKey;
    ownerAddress: string;
  } = await request.json();

  const chainId = "secret-4";

  console.log("setup/home-account setting up...");
  const messagesSdk = Messages.chainId(chainId);
  const client = new SecretJsClient(chainId);
  const { wallet, signer } = getFeeLender(chainId);

  console.log("setup/home-account creating message...");
  invariant(wallet.address, "no fee lender wallet address");
  const message = messagesSdk.getCreateWalletMessage(
    body.owner,
    body.ownerAddress,
    wallet.address,
  );
  console.log(
    "setup/home-account attempting message: " + JSON.stringify(message),
  );
  console.log("setup/home-account creating transaction...");
  const signedTransaction = await client.createAndSignTransaction({
    signer,
    messages: [message],
  });
  const broadcastTransactionResult = await client.broadcastSignedTransaction(
    signedTransaction,
  );
  console.log(broadcastTransactionResult);

  if (!broadcastTransactionResult.success) {
    return {
      ownerAddress: body.owner.address,
      homeAccountAddress: "TX FAILED",
      txResult: broadcastTransactionResult,
    };
  }

  const txResult = broadcastTransactionResult.rawResult as TxResponse;
  try {
    invariant(txResult.arrayLog, "No log found");
    // TODO: zod
    const homeAccountAddress = txResult.arrayLog?.find((log) => {
      return log.type === "instantiate" && log.key === "contract_address";
    })?.value;
    invariant(homeAccountAddress, "Contract address not found");
    return NextResponse.json({
      ownerAddress: body.ownerAddress,
      homeAccountAddress,
      txResult,
    });
  } catch (e) {
    return NextResponse.json({
      ownerAddress: body.ownerAddress,
      homeAccountAddress: "PARSE ERROR",
      txResult: broadcastTransactionResult,
    });
  }
}
