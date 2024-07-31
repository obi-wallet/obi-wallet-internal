import { getFeeLender } from "@/lib/fee-lender";
import { triggerEvent } from "@/points";
import { updateOwner } from "@/wallet-data-backup/worker-client";
import { HexEncodedString } from "@obi-wallet/encoding";
import {
  HomeChainIdSchema,
  Messages,
  MultisigKey,
  SecretJsClient,
  WalletData,
} from "@obi-wallet/sdk";
import { get } from "lodash";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  homeChainId: HomeChainIdSchema,
  userAccountAddress: z.string(),
  userAccountCodeHash: z.string(),
  signatures: z.array(HexEncodedString),
  previousOwner: MultisigKey.schema.migratableSchema,
  walletData: WalletData,
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
    userAccountAddress,
    userAccountCodeHash,
    signatures,
    previousOwner,
    walletData,
  } = result.data;

  const client = new SecretJsClient(homeChainId);
  const messagesSdk = Messages.chainId(homeChainId);

  const { wallet, signer } = getFeeLender(homeChainId);
  invariant(wallet.address, "no fee lender wallet address");

  const message = messagesSdk.getConfirmUpdateOwnerMessage(
    userAccountAddress,
    userAccountCodeHash,
    wallet.address,
    signatures,
  );

  const signedTransaction = await client.createAndSignTransaction({
    signer,
    messages: [message],
  });
  const broadcastTransactionResult =
    await client.broadcastSignedTransaction(signedTransaction);

  console.log(broadcastTransactionResult);

  if (broadcastTransactionResult.success) {
    const response = await updateOwner({ walletData, previousOwner });
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

    // trigger key evnet : "add-key" or "remove-key" event will be triggered
    const previousKeys = previousOwner.keys;
    const currentKeys = walletData.owner.keys;

    if (previousKeys[0] !== undefined && currentKeys[0] !== undefined) {
      while (
        get(previousKeys[0], "type") === currentKeys[0].type &&
        previousKeys[0].payload.publicKey.value ===
          currentKeys[0].publicKey.value
      ) {
        previousKeys.shift();
        currentKeys.shift();
      }

      // "remove-key" promises
      const removeKeyPromises = previousKeys.map((key) => {
        return triggerEvent({
          userEntryAddress: walletData.userEntryAddress,
          event: {
            type: "remove-key",
            payload: {
              type: get(key, "type"),
            },
          },
        });
      });

      // "add-key" promises
      const addKeyPromises = currentKeys.map((key) => {
        triggerEvent({
          userEntryAddress: walletData.userEntryAddress,
          event: {
            type: "add-key",
            payload: {
              type: key.type,
            },
          },
        });
      });

      // trigger events
      try {
        await Promise.all(removeKeyPromises);
        await Promise.all(addKeyPromises);
      } catch (e) {
        console.error(e);
      }
    }
  }

  return NextResponse.json({
    success: broadcastTransactionResult.success,
  });
}
