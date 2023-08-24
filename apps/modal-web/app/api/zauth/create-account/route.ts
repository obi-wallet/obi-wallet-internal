import {
  AccountValidationResult,
  KeyType,
  Messages,
  MultisigKey,
  Sdk,
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
    const UserModel = await connect();
    const existingUser = await UserModel.findOne({ userId });

    if (existingUser) {
      const homeChain = existingUser.homeChains.get(body.chainId);
      if (homeChain) {
        const keyPair = homeChain.zAuthKeyPair;
        const ethereumAccount = await recoverOrCreateEthereumAccount({
          chainId: body.chainId,
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

    const messagesSdk = Messages.chainId(body.chainId);
    const sdk = Sdk.chainId(body.chainId);

    const signer = new Secp256k1PrivateKeySigner(keyPair.privateKey);
    const client = new SecretJsClient(body.chainId);

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

    invariant(contractAddress, "Contract address not found");

    const ethereumAccount = await generateEthereumAccount({
      chainId: body.chainId,
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
      existingUser.homeChains.set(body.chainId, homeChain);
      existingUser.save();
    } else {
      await UserModel.create({
        userId,
        homeChains: {
          [body.chainId]: homeChain,
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
