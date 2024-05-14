import { getFeeLender } from "@/lib/fee-lender";
import { isTest } from "@/lib/testing";
import { Encoding } from "@obi-wallet/encoding";
import {
  ChainIdSchema,
  SecretJsClient,
  SecretJsHomeChains,
} from "@obi-wallet/sdk";
import { randomBytes } from "ethers";
import { MsgExecuteContract, TxResponse } from "secretjs";
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

  const chain = SecretJsHomeChains[chainId];
  const client = new SecretJsClient(chainId);
  const message = new MsgExecuteContract({
    sender: wallet.address,
    contract_address: chain.accountCreator.address,
    code_hash: chain.accountCreator.codeHash,
    msg: {
      new_account: {
        owner: wallet.address,
        signers: {
          signers: [
            {
              address: wallet.address,
              ty: "creator",
              pubkey_base_64: Encoding.fromBytes(wallet.publicKey).toBase64(),
            },
          ],
        },
        fee_debt: 0,
        update_delay: 0,
        // next_hash_seed is some randomness and doesn't need to be stored at all
        next_hash_seed: Encoding.fromBytes(randomBytes(32)).toHex(),
      },
    },
  });

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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
      ...(isTest()
        ? {
            __test: {
              message,
            },
          }
        : {}),
    });
  } catch (e) {
    console.error(e);
    return new Response("Parse error", {
      status: 500,
    });
  }
}
