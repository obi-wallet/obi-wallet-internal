import { EthereumAccount } from "@obi-wallet/headless-ui";
import {
  KeyType,
  Messages,
  MultisigKey,
  SecretJsChainId,
  SecretJsClient,
  generateSec256k1KeyPair,
} from "@obi-wallet/sdk";
import { NextResponse } from "next/server";
import { TxResponse } from "secretjs";
import invariant from "tiny-invariant";

// import { cookies } from "next/headers";
import { connect } from "../../../../src/db";
import { HomeChain } from "../../../../src/db/schema";
import { getFeeLender } from "../../../../src/fee-lender";
import {
  generateEthereumAccount,
  recoverEthereumAccount,
} from "../../../../src/stackup";
import { fetchUserId } from "../../../../src/zauth";

export async function POST(request: Request) {
  const body: {
    accessToken?: string;
    refreshToken?: string;
    homeChainId: SecretJsChainId;
  } = await request.json();

  const accessToken = body.accessToken;
  // ?? cookies().get("accessToken")?.value;

  const refreshToken = body.accessToken;
  // ?? cookies().get("refreshToken")?.value;

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
        const ethereumAccount = await recoverEthereumAccount({
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
    const { wallet, signer } = getFeeLender(body.homeChainId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function generateProxyAddress() {
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
      const broadcastTransactionResult =
        await client.broadcastSignedTransaction(signedTransaction);
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
      return contractAddress;
    }

    async function missing(): Promise<string> {
      return "MISSING";
    }

    const [proxyAddress, ethereumAccount] = await Promise.all([
      // generateProxyAddress()
      missing(),
      generateEthereumAccount({
        chainId: body.homeChainId,
        keyPair,
      }),
    ] as [Promise<string>, Promise<EthereumAccount>]);

    const homeChain: HomeChain = {
      zAuthKeyPair: keyPair,
      targetChain: {
        publicKey: ethereumAccount.publicKey,
        evmAddress: ethereumAccount.address,
      },
      proxyAddress,
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
      proxyAddress,
      ethereumAccount,
    };
  }

  const user = await fetchOrCreateUser();

  /*
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
  */

  return NextResponse.json(user);
}
