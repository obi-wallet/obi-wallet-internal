import { EthereumAccount } from "@obi-wallet/headless-ui";
import {
  Secp256k1KeyPair,
  SecretJsChainId,
  generateSec256k1KeyPair,
} from "@obi-wallet/sdk";
import { NextResponse } from "next/server";

// import { cookies } from "next/headers";
import { connect } from "../../../../src/db";
import { HomeChain } from "../../../../src/db/schema";
import {
  generateEthereumAccount,
  generateEthereumAddress,
  recoverEthereumAccount,
} from "../../../../src/stackup";
import { fetchUserId } from "../../../../src/zauth";

export async function POST(request: Request) {
  const body: {
    accessToken?: string;
    refreshToken?: string;
    homeChainId: SecretJsChainId;
    deviceKeypair: Secp256k1KeyPair;
  } = await request.json();

  const accessToken = body.accessToken;
  // ?? cookies().get("accessToken")?.value;

  const refreshToken = body.accessToken;
  // ?? cookies().get("refreshToken")?.value;

  if (accessToken && refreshToken) {
    const userId = accessToken ? await fetchUserId(accessToken) : null;
    if (!accessToken || !refreshToken || !userId) {
      return NextResponse.json(
        {
          error: "invalid token",
        },
        { status: 401 },
      );
    }

    const user = await fetchOrCreateZauthUser(userId, body.homeChainId);
    return NextResponse.json(user);
  } else {
    const user = await fetchOrCreateDeviceUser(body.deviceKeypair);
    return NextResponse.json(user);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
/*
async function generateProxyAddress(
  chainId: chainId,
  keyPair: Secp256k1KeyPair
) {
  const messagesSdk = Messages.chainId(chainId);
  const client = new SecretJsClient(chainId);
  const { wallet, signer } = getFeeLender(chainId);

  const multisigKey = MultisigKey.create(chainId, {
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
*/

async function missing(): Promise<string> {
  return "MISSING";
}

async function fetchOrCreateZauthUser(
  userId: string,
  chainId: SecretJsChainId,
) {
  const UserModel = await connect();
  const existingUser = await UserModel.findOne({ userId });

  if (existingUser) {
    const homeChain = existingUser.homeChains.get(chainId);
    if (homeChain) {
      const keyPair = homeChain.zAuthKeyPair;
      const ethereumAccount = await recoverEthereumAccount({
        chainId: chainId,
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

  const [proxyAddress, ethereumAccount] = await Promise.all([
    // generateProxyAddress()
    missing(),
    generateEthereumAccount({
      chainId,
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
    existingUser.homeChains.set(chainId, homeChain);
    existingUser.save();
  } else {
    await UserModel.create({
      userId,
      homeChains: {
        [chainId]: homeChain,
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

async function fetchOrCreateDeviceUser(deviceKeypair: Secp256k1KeyPair) {
  // try to recover Ethereum account from devicePubkey
  const chainId = "secret-4";
  const ethereumAccount = {
    chainId: chainId,
    zAuthKeyPair: deviceKeypair,
    proxyAddress: "MISSING",
    targetChain: {
      publicKey: deviceKeypair.publicKey,
      evmAddress: await generateEthereumAddress(deviceKeypair),
    },
  };
  return {
    newUser: true,
    publicKey: deviceKeypair.publicKey,
    proxyAddress: "MISSING",
    ethereumAccount: ethereumAccount,
  };

  /*
  const keyPair = generateSec256k1KeyPair();

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
  */
}
