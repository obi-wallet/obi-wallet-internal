import { SecretJsChainId, TargetChainId } from "@obi-wallet/sdk";
import { Signer, SigningKey, Wallet } from "ethers";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Client, IUserOperation, Presets } from "userop";

import { connectWorkaround } from "../../../src/db";
import { getConfig } from "../../../src/stackup";
import { fetchUserId } from "../../../src/zauth";

export async function POST(request: Request) {
  const body: {
    homeChainId: SecretJsChainId;
    targetChainId: TargetChainId;
    contractAddress: string;
    data: string;
    tokens: {
      zepetoAccessToken: string;
      zepetoRefreshToken: string;
    };
  } = await request.json();

  const accessToken =
    cookies().get("zepetoAccessToken")?.value ?? body.tokens.zepetoAccessToken;
  const refreshToken =
    cookies().get("zepetoRefreshToken")?.value ??
    body.tokens.zepetoRefreshToken;

  const userId = accessToken ? await fetchUserId(accessToken) : null;

  if (!accessToken || !refreshToken || !userId) {
    return NextResponse.json(
      {
        error: "invalid token",
      },
      { status: 401 },
    );
  }

  const UserModel = await connectWorkaround();
  const user = await UserModel.findOne({ userId });

  if (!user) {
    return NextResponse.json(
      {
        error: "user not found",
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
  const signingKey = new SigningKey(
    Buffer.from(user.ethKeyPair.privateKey, "base64"),
  );
  const signer: Signer = new Wallet(signingKey);
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    // @ts-expect-error this should be fine
    signer,
    config.rpcUrl,
    { paymasterMiddleware },
  );

  async function buildUserOperation() {
    if (body.contractAddress) {
      return await client.buildUserOperation(
          simpleAccount.execute(body.contractAddress, 0, body.data)
      );
    } else {
      return await client.buildUserOperation(
          simpleAccount.setCallData(body.data)
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
