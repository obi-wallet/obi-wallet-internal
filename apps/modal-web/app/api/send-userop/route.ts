import {
  SecretJsChainId,
  TargetChainId,
  getOrCreateDeviceKeyPair,
} from "@obi-wallet/sdk";
// import { Signer, SigningKey, Wallet } from "ethers";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Client, IUserOperation, Presets } from "userop";

import { connect } from "../../../src/db";
import { SecretJsSigner } from "../../../src/secret-js-signer";
import { getConfig } from "../../../src/stackup";
import { fetchUserId } from "../../../src/zauth";

export async function POST(request: Request) {
  const body: {
    homeChainId: SecretJsChainId;
    targetChainId: TargetChainId;
    contractAddress: string;
    data: string;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  } = await request.json();

  const accessToken =
    cookies().get("accessToken")?.value ?? body.tokens.accessToken;
  const refreshToken =
    cookies().get("refreshToken")?.value ?? body.tokens.refreshToken;

  const userId = accessToken ? await fetchUserId(accessToken) : null;

  if (!accessToken || !refreshToken || !userId) {
    return NextResponse.json(
      {
        error: "invalid token",
      },
      { status: 401 },
    );
  }

  const UserModel = await connect();
  const user = await UserModel.findOne({ userId });
  const homeChain = user?.homeChains.get(body.homeChainId);
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
  let signingKey, _;
  if (!homeChain.zAuthKeyPair) {
    [signingKey, _] = await getOrCreateDeviceKeyPair(false, false);
  } else {
    signingKey = homeChain.zAuthKeyPair;
  }
  const signer = new SecretJsSigner(
    {
      chainId: body.homeChainId,
      zAuthKeyPair: homeChain.zAuthKeyPair,
      proxyAddress: homeChain.proxyAddress,
      targetChain: homeChain.targetChain,
    },
    signingKey,
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
    console.log("userOp", userOperation);
    const event = await userOperation.wait();
    console.log("event", event);
    return NextResponse.json(event);
  } catch (e) {
    console.log("error", e);
    return NextResponse.json(e);
  }
}
