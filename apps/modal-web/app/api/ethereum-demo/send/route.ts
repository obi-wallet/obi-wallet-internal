// use client
import { getOrCreateDeviceKeyPair } from "@obi-wallet/sdk";
import {
  Secp256k1PublicKey,
  SecretJsChainId,
  TargetChainId,
} from "@obi-wallet/sdk";
import { Contract, JsonRpcProvider, parseUnits } from "ethers";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Client, IUserOperation, Presets } from "userop";

import { connect } from "../../../../src/db";
import { SecretJsSigner } from "../../../../src/secret-js-signer";
import { getConfig } from "../../../../src/stackup";
import { fetchUserId } from "../../../../src/zauth";
import invariant from "tiny-invariant";

export async function POST(request: Request) {
  const body: {
    homeChainId: SecretJsChainId;
    targetChainId: TargetChainId;
    publicKey: Secp256k1PublicKey;
    to: string;
    token: {
      id: string;
      rawAmount: string;
    };
  } = await request.json();

  const accessToken = cookies().get("accessToken")?.value;
  const refreshToken = cookies().get("refreshToken")?.value;

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

  const provider = new JsonRpcProvider(config.rpcUrl);
  const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
    config.paymaster.rpcUrl!,
    config.paymaster.context,
  );
  const client = await Client.init(config.rpcUrl!);
  const amount = parseUnits(body.token.rawAmount, 0);
  let signingKey, _;
  if (!homeChain.zAuthKeyPair) {
    [signingKey, _] = await getOrCreateDeviceKeyPair(true, false, false);
  } else {
    signingKey = homeChain.zAuthKeyPair;
  }
  invariant(signingKey, "signingKey must be defined");
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
    if (body.token.id === "eth") {
      return await client.buildUserOperation(
        simpleAccount.execute(body.to, amount, "0x"),
      );
    } else {
      const erc20 = new Contract(
        body.token.id,
        [
          // Read-Only Functions
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)",

          // Authenticated Functions
          "function transfer(address to, uint amount) returns (bool)",
          "function approve(address spender, uint amount) returns (bool)",

          // Events
          "event Transfer(address indexed from, address indexed to, uint amount)",
        ] as const,
        provider,
      );
      return await client.buildUserOperation(
        simpleAccount.execute(
          await erc20.getAddress(),
          0,
          erc20.interface.encodeFunctionData("transfer", [body.to, amount]),
        ),
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
