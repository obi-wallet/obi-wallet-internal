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
    body.accessToken
    // ?? cookies().get("accessToken")?.value;

  const refreshToken =
    body.accessToken
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

    const [proxyAddress, ethereumAccount] = await Promise.all([
      // generateProxyAddress(),
      Promise.resolve("MISSING"),
      generateEthereumAccount({
        chainId: body.homeChainId,
        zAuthKeyPair: keyPair,
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
}