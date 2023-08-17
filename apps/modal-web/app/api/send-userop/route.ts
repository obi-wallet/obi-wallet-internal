import { SecretJsChainId } from "@obi-wallet/sdk";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Client, IUserOperation, Presets } from "userop";

import { connect } from "../../../src/db";
import { SecretJsSigner } from "../../../src/secret-js-signer";
import { fetchUserId } from "../../../src/zauth";

const config = {
  rpcUrl: process.env.STACKUP_RPC_URL,
  paymaster: {
    rpcUrl: process.env.STACKUP_PAYMASTER_RPC_URL,
    context: { type: "payg" },
  },
};

export async function POST(request: Request) {
  const body: {
    chainId: SecretJsChainId;
    contractAddress: string;
    data: string;
  } = await request.json();

  const accessToken = cookies().get("zepetoAccessToken")?.value;
  const refreshToken = cookies().get("zepetoRefreshToken")?.value;

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

  const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
    config.paymaster.rpcUrl!,
    config.paymaster.context,
  );
  const client = await Client.init(config.rpcUrl!);
  const signer = new SecretJsSigner({
    chainId: body.chainId,
    keyPair: {
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: user.publicKey,
      },
      privateKey: user.privateKey,
    },
  });
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    // @ts-expect-error this should be fine
    signer,
    config.rpcUrl,
    { paymasterMiddleware },
  );

  async function buildUserOperation() {
    return await client.buildUserOperation(
      simpleAccount.execute(body.contractAddress, 0, body.data),
    );
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
