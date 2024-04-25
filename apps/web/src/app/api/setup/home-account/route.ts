import { getFeeLender } from "@/lib/fee-lender";
import { ChainIdSchema, Messages, SecretJsClient } from "@obi-wallet/sdk";
import { TxResponse } from "secretjs";
import invariant from "tiny-invariant";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  chainId: ChainIdSchema,
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { chainId } = result.data;
  const { wallet, signer, lenderIndex } = getFeeLender(chainId);

  const client = new SecretJsClient(chainId);
  const messagesSdk = Messages.chainId(chainId);
  const message = messagesSdk.getCreateWalletMessage(
    wallet.address,
    Buffer.from(wallet.publicKey).toString("base64"),
    wallet.address,
  );

  const signedTransaction = await client.createAndSignTransaction({
    signer,
    messages: [message],
  });

  const broadcastTransactionResult =
    await client.broadcastSignedTransactionOrMockTxDuringTest({
      signedTransaction,
      hash: "60CC34C88CEF401B185E983A210DCA840FA523BE5BD6297FF5D7164F89AE45EB",
    });

  if (!broadcastTransactionResult.success) {
    return new Response("TX failed", {
      status: 500,
    });
  }

  try {
    const txResult = broadcastTransactionResult.rawResult as TxResponse;
    invariant(txResult.arrayLog, "No log found");
    const matchingLogs = txResult.arrayLog.filter((log) => {
      return log.type === "instantiate" && log.key === "contract_address";
    });
    const homeAccountAddress = matchingLogs?.[1]?.value;
    invariant(homeAccountAddress, "Contract address not found");
    return Response.json({
      ownerAddress: wallet.address,
      homeAccountAddress,
      txResult,
      ownerIndex: lenderIndex,
    });
  } catch (e) {
    console.error(e);
    return new Response("Parse error", {
      status: 500,
    });
  }
}
