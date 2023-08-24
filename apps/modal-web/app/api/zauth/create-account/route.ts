import {
  KeyType,
  Messages,
  MultisigKey,
  Secp256k1PrivateKeySigner,
  SecretJsChainId,
  SecretJsClient,
  generateSec256k1KeyPair,
} from "@obi-wallet/sdk";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TxResponse, Wallet } from "secretjs";
import invariant from "tiny-invariant";

import { connect } from "../../../../src/db";
import { HomeChain } from "../../../../src/db/schema";
import {
  generateEthereumAccount,
  recoverOrCreateEthereumAccount,
} from "../../../../src/stackup";
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
      const homeChain = existingUser.homeChains.get(body.homeChainId);
      if (homeChain) {
        const keyPair = homeChain.zAuthKeyPair;
        const ethereumAccount = await recoverOrCreateEthereumAccount({
          chainId: body.homeChainId,
          zAuthKeyPair: homeChain.zAuthKeyPair,
          proxyAddress: homeChain.proxyAddress,
          targetChain: homeChain.targetChain,
        });
        return {
          newUser: false,
          publicKey: keyPair.publicKey,
          proxyAddress: homeChain.proxyAddress,
          ethereumAccount,
        };
      }
    }

    const keyPair = generateSec256k1KeyPair();

    const messagesSdk = Messages.chainId(body.homeChainId);
    const client = new SecretJsClient(body.homeChainId);

    const feeLenders = JSON.parse(process.env.FEE_LENDERS || "[]");
    const feeLender = feeLenders[Math.floor(Math.random() * feeLenders.length)];
    const wallet = new Wallet(feeLender);
    const signer = new Secp256k1PrivateKeySigner(
      Buffer.from(wallet.privateKey).toString("base64"),
    );

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
    const message = messagesSdk.getCreateWalletMessage(multisigKey);
    (message as { sender: string }).sender = wallet.address;
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

    const ethereumAccount = await generateEthereumAccount({
      chainId: body.homeChainId,
      zAuthKeyPair: keyPair,
      proxyAddress: contractAddress,
    });

    const homeChain: HomeChain = {
      zAuthKeyPair: keyPair,
      targetChain: {
        publicKey: ethereumAccount.publicKey,
        evmAddress: ethereumAccount.address,
      },
      proxyAddress: contractAddress,
    };

    if (existingUser) {
      existingUser.homeChains.set(body.homeChainId, homeChain);
      existingUser.save();
    } else {
      await UserModel.create({
        userId,
        homeChains: {
          [body.homeChainId]: homeChain,
        },
      });
    }

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
