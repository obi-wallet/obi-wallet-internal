import {
  Secp256k1KeyPair,
  SecretJsChainId,
  TargetChainId,
} from "@obi-wallet/sdk";
// import { Signer, SigningKey, Wallet } from "ethers";
import { HomeChain } from "apps/modal-web/src/db/schema";
import { Signer, Wallet } from "ethers";
//import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";
import { Client, IUserOperation, Presets } from "userop";

import { connect } from "../../../src/db";
import { generateEthereumAddresses, getConfig } from "../../../src/stackup";
import { fetchUserId } from "../../../src/zauth";

export async function POST(request: Request) {
  const body: {
    homeChainId: SecretJsChainId;
    targetChainId: TargetChainId;
    contractAddress: string;
    data: string;
    tokens: {
      accessToken?: string;
      refreshToken?: string;
    };
    // need to handle outside instead, and split this into two routes
    deviceKeyPair?: Secp256k1KeyPair;
  } = await request.json();

  const accessToken =
    body.tokens.accessToken;
  const refreshToken =
    body.tokens.refreshToken;
  let homeChain: HomeChain | undefined;
  if (!body.deviceKeyPair?.privateKey && accessToken && refreshToken) {
    const userId = await fetchUserId(accessToken);
    console.log("in send op, access token is:" + accessToken);
    const UserModel = await connect();
    invariant(userId, "User ID not received");
    console.log("User id is: " + userId);
    const user = await UserModel.findOne({ userId });
    const homeChain = user?.homeChains.get("secret-4");
    if (!homeChain) {
      return NextResponse.json(
        {
          error: "user / home chain combination not found",
        },
        { status: 400 },
      );
    }
  } else {
    //console.warn("incoming device key: " + JSON.stringify(body.deviceKeyPair?.privateKey));
    invariant(body.deviceKeyPair?.privateKey, "pass in device key");
    homeChain = {
      zAuthKeyPair: body.deviceKeyPair,
      targetChain: {
        publicKey: body.deviceKeyPair.publicKey,
        evmAddress: (await generateEthereumAddresses(body.deviceKeyPair))
          .evmUserContractAddress,
      },
      proxyAddress: "MISSING",
    };
  }
  if (!homeChain) {
    return NextResponse.json(
      {
        error: "user / home chain combination not found",
      },
      { status: 400 },
    );
  }

  const config = getConfig(body.targetChainId);
  if (!config) {
    return NextResponse.json(
      {
        error: "invalid target chain",
      },
      { status: 400 },
    );
  }

  const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
    config.paymaster.rpcUrl!,
    config.paymaster.context,
  );
  const client = await Client.init(config.rpcUrl!);
  /*const signer = new SecretJsSigner(
    {
      chainId: body.homeChainId,
      zAuthKeyPair: homeChain.zAuthKeyPair,
      proxyAddress: homeChain.proxyAddress,
      targetChain: homeChain.targetChain,
    },
    homeChain.zAuthKeyPair,
  );*/
  const signer: Signer = new Wallet(
    Buffer.from(homeChain.zAuthKeyPair.privateKey, "base64").toString("hex"),
  );
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    // @ts-expect-error this should be fine
    signer,
    config.rpcUrl,
    { paymasterMiddleware },
  );

  async function buildUserOperation() {
    if (body.contractAddress) {
      return await client.buildUserOperation(
        simpleAccount.execute(body.contractAddress, 0, body.data),
      );
    } else {
      return await client.buildUserOperation(
        simpleAccount.setCallData(body.data),
      );
    }
  }

  async function handleUserOperation(userOperation: IUserOperation) {
    try {
      return await client.execUserOperation(userOperation);
    } catch (e) {
      const signature = userOperation.signature as string;
      userOperation.signature = `${signature.substring(
        0,
        userOperation.signature.length - 2,
      )}1b`;
      return await client.execUserOperation(userOperation);
    }
  }

  try {
    const builtUserOperation = await buildUserOperation();
    const userOperation = await handleUserOperation(builtUserOperation);
    const event = await userOperation.wait();
    console.log("event", event);
    return NextResponse.json(event);
  } catch (e) {
    console.log("error", e);
    return NextResponse.json(e);
  }
}
