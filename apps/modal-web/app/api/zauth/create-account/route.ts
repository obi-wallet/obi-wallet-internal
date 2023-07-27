import {
  AccountValidationResult,
  KeyType,
  Messages,
  MultisigKey,
  Sdk,
  Secp256k1PrivateKeySigner,
  Secp256k1PublicKey,
  SecretJsChainId,
  SecretJsClient,
  generateSec256k1KeyPair,
} from "@obi-wallet/sdk";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TxResponse } from "secretjs";

import { recoverOrCreateEthereumAccount } from "../../../../src/stackup";
import { fetchUserId } from "../../../../src/zauth";
import { UserModel } from "../../../../src/zauth/schema";

export async function POST(request: Request) {
  const body: {
    accessToken?: string;
    refreshToken?: string;
    chainId: SecretJsChainId;
  } = await request.json();

  const accessToken =
    body.accessToken ?? cookies().get("zepetoAccessToken")?.value;
  const refreshToken =
    body.refreshToken ?? cookies().get("zepetoRefreshToken")?.value;

  const userId = accessToken ? await fetchUserId(accessToken) : null;

  if (!accessToken || !refreshToken || !userId) {
    return NextResponse.json(
      {
        error: "invalid token",
      },
      { status: 401 },
    );
  }

  async function fetchOrCreateUser() {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingUser = await UserModel.findOne({ userId });

    if (existingUser) {
      const publicKey: Secp256k1PublicKey = {
        type: "tendermint/PubKeySecp256k1",
        value: existingUser.publicKey,
      };
      const ethereumAccount = await recoverOrCreateEthereumAccount({
        publicKey,
        chainId: body.chainId,
      });

      return {
        publicKey,
        proxyAddress: existingUser.proxyAddress,
        ethereumAccount,
      };
    }

    const keyPair = generateSec256k1KeyPair();

    const ethereumAccount = await recoverOrCreateEthereumAccount({
      publicKey: keyPair.publicKey,
      chainId: body.chainId,
    });

    const messagesSdk = Messages.chainId(body.chainId);
    const sdk = Sdk.chainId(body.chainId);

    const signer = new Secp256k1PrivateKeySigner(keyPair.privateKey);
    const client = new SecretJsClient(body.chainId);

    const address = sdk.transactions.getAddressOfPublicKey(keyPair.publicKey);

    const accountValidationResult = await sdk.transactions.validateAccount(
      address,
    );
    if (accountValidationResult < AccountValidationResult.ACCOUNT_NOT_READY) {
      console.log("Need to prepare account", address);
      return {
        approved: false,
      };
    }

    const multisigKey = MultisigKey.create(body.chainId, {
      keys: [
        {
          type: KeyType.ZAuth,
          payload: {
            publicKey: keyPair.publicKey,
          },
        },
      ],
      threshold: 1,
    });
    const signedTransaction = await client.createAndSignTransaction({
      signer,
      messages: [messagesSdk.getCreateWalletMessage(multisigKey)],
    });
    const broadcastTransactionResult = await client.broadcastSignedTransaction(
      signedTransaction,
    );

    if (!broadcastTransactionResult.success) {
      return {
        approved: true,
        payload: {
          success: false,
          description: "Transaction failed",
          originalPayload: broadcastTransactionResult,
        },
      };
    }

    const response = broadcastTransactionResult.rawResult as TxResponse;
    const contractAddress = response.arrayLog?.find((log) => {
      return log.type === "instantiate" && log.key === "contract_address";
    })?.value;

    await UserModel.create({
      userId,
      publicKey: keyPair.publicKey.value,
      privateKey: keyPair.privateKey,
      proxyAddress: contractAddress,
    });

    return {
      publicKey: keyPair.publicKey,
      proxyAddress: contractAddress,
      ethereumAccount,
    };
  }

  const user = await fetchOrCreateUser();

  cookies().set({
    name: "zepetoAccessToken",
    value: accessToken,
    httpOnly: true,
    maxAge: 3600000,
    path: "/",
  });
  cookies().set({
    name: "zepetoRefreshToken",
    value: refreshToken,
    httpOnly: true,
    maxAge: 3600000,
    path: "/",
  });

  return NextResponse.json(user);
}
