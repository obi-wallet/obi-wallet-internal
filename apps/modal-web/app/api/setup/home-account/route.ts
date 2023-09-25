import { Messages, SecretJsChainId, SecretJsClient } from "@obi-wallet/sdk";
import { getFeeLender } from "apps/modal-web/src/fee-lender";
import { NextResponse } from "next/server";
import { TxResponse } from "secretjs";
import invariant from "tiny-invariant";

/// Sets up a new home account for the user, owned by the specified address.
/// Returns the resulting address.
export async function POST(request: Request) {
  const _request = request;
  const chainId: SecretJsChainId = "secret-4";
  console.log("setup/home-account setting up...");
  // new lender so we don't run into sequence errors
  // need to update this so it doesn't happen to pick same as before
  const { wallet, signer, lenderIndex } = getFeeLender(chainId);

  console.log("setup/home-account creating message...");
  invariant(wallet.address, "no fee lender wallet address");
  const client = new SecretJsClient(chainId);
  const messagesSdk = Messages.chainId(chainId);
  const message = messagesSdk.getCreateWalletMessage(
    wallet.address,
    Buffer.from(wallet.publicKey).toString("base64"),
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
  const broadcastTransactionResult =
    await client.broadcastSignedTransaction(signedTransaction);
  console.log(broadcastTransactionResult);

  if (!broadcastTransactionResult.success) {
    return NextResponse.json({
      ownerAddress: wallet.address,
      homeAccountAddress: "TX FAILED",
      txResult: broadcastTransactionResult,
      ownerIndex: lenderIndex!,
    });
  }

  const txResult = broadcastTransactionResult.rawResult as TxResponse;
  try {
    invariant(txResult.arrayLog, "No log found");
    // TODO: zod
    const _accountLogicAddress = txResult.arrayLog?.find((log) => {
      return log.type === "instantiate" && log.key === "contract_address";
    })?.value;
    const matchingLogs = txResult.arrayLog?.filter((log) => {
      return log.type === "instantiate" && log.key === "contract_address";
    });
    const homeAccountAddress =
      matchingLogs && matchingLogs.length > 1
        ? matchingLogs[1].value
        : undefined;

    invariant(homeAccountAddress, "Contract address not found");
    return NextResponse.json({
      ownerAddress: wallet.address,
      homeAccountAddress,
      txResult,
      ownerIndex: lenderIndex!,
    });
  } catch (e) {
    return NextResponse.json({
      ownerAddress: wallet.address,
      homeAccountAddress: "PARSE ERROR",
      txResult: broadcastTransactionResult,
      ownerIndex: 0,
    });
  }
}
