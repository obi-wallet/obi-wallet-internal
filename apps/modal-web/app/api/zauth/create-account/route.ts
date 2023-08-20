import {
  AccountValidationResult,
  KeyType,
  Messages,
  MultisigKey,
  Sdk,
  Secp256k1KeyPair,
  Secp256k1PrivateKeySigner,
  SecretJsChainId,
  SecretJsClient,
  generateSec256k1KeyPair,
} from "@obi-wallet/sdk";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MsgSend, TxResponse, Wallet, stringToCoins } from "secretjs";
import invariant from "tiny-invariant";

import { connect } from "../../../../src/db";
import { recoverOrCreateEthereumAccount } from "../../../../src/stackup";
import { fetchUserId } from "../../../../src/zauth";

export async function POST(request: Request) {
  const body: {
    accessToken?: string;
    refreshToken?: string;
    homeChainId: SecretJsChainId;
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
    const UserModel = await connect();
    const existingUser = await UserModel.findOne({ userId });

    if (existingUser) {
      const keyPair: Secp256k1KeyPair = {
        publicKey: {
          type: "tendermint/PubKeySecp256k1",
          value: existingUser.publicKey,
        },
        privateKey: existingUser.privateKey,
      };
      const ethereumAccount = await recoverOrCreateEthereumAccount({
        keyPair,
        chainId: body.homeChainId,
        proxyAddress: existingUser.proxyAddress,
      });

      return {
        newUser: false,
        publicKey: keyPair.publicKey,
        proxyAddress: existingUser.proxyAddress,
        ethereumAccount,
      };
    }

    const keyPair = generateSec256k1KeyPair();

    const messagesSdk = Messages.chainId(body.homeChainId);
    const sdk = Sdk.chainId(body.homeChainId);

    const signer = new Secp256k1PrivateKeySigner(keyPair.privateKey);
    const client = new SecretJsClient(body.homeChainId);

    const address = sdk.transactions.getAddressOfPublicKey(keyPair.publicKey);

    const accountValidationResult = await sdk.transactions.validateAccount(
      address,
    );
    if (accountValidationResult <= AccountValidationResult.ACCOUNT_NOT_READY) {
      const feeLenders = JSON.parse(process.env.FEE_LENDERS || "[]");
      const feeLender =
        feeLenders[Math.floor(Math.random() * feeLenders.length)];
      const wallet = new Wallet(feeLender);
      const msg = new MsgSend({
        from_address: wallet.address,
        to_address: address,
        amount: stringToCoins("200000uscrt"),
      });
      await client.withSigningSecretNetworkClient(wallet, async (c) => {
        return await c.tx.broadcast([msg], client.defaultTxOptions);
      });
    }

    const multisigKey = MultisigKey.create(body.homeChainId, {
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

    invariant(contractAddress, "Contract address not found");

    const ethereumAccount = await recoverOrCreateEthereumAccount({
      keyPair,
      chainId: body.homeChainId,
      proxyAddress: contractAddress,
    });

    await UserModel.create({
      userId,
      publicKey: keyPair.publicKey.value,
      privateKey: keyPair.privateKey,
      proxyAddress: contractAddress,
    });

    return {
      newUser: true,
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
    ...(process.env.NODE_ENV === "production"
      ? {
          sameSite: "none",
          secure: true,
        }
      : {}),
  });
  cookies().set({
    name: "zepetoRefreshToken",
    value: refreshToken,
    httpOnly: true,
    maxAge: 3600000,
    path: "/",
    ...(process.env.NODE_ENV === "production"
      ? {
          sameSite: "none",
          secure: true,
        }
      : {}),
  });

  return NextResponse.json(user);
}
