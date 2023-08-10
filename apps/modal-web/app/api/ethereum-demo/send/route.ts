import { Secp256k1PublicKey, SecretJsChainId } from "@obi-wallet/sdk";
import { Contract, JsonRpcProvider, parseUnits } from "ethers";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Client, IUserOperation, Presets } from "userop";

import { connect } from "../../../../src/db";
import { SecretJsSigner } from "../../../../src/secret-js-signer";
import { fetchUserId } from "../../../../src/zauth";

const config = {
  rpcUrl: process.env.STACKUP_RPC_URL,
  paymaster: {
    rpcUrl: process.env.STACKUP_PAYMASTER_RPC_URL,
    context: { type: "payg" },
  },
};

const provider = new JsonRpcProvider(config.rpcUrl);

export async function POST(request: Request) {
  const body: {
    chainId: SecretJsChainId;
    publicKey: Secp256k1PublicKey;
    to: string;
    token: {
      id: string;
      rawAmount: string;
    };
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
  const amount = parseUnits(body.token.rawAmount, 0);
  const feeRatio = parseFloat(process.env.FEE_USEROP_RATIO as string) || 0.001;
  const feeAmount = Math.floor(Number(body.token.rawAmount) * feeRatio);
  const signer = new SecretJsSigner({
    chainId: body.chainId,
    keyPair: {
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: user.publicKey,
      },
      privateKey: "",
    },
  });
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

      const dest = await erc20.getAddress();

      console.log({ dest, amount, feeAmount, to: body.to });
      const userop = await client.buildUserOperation(
        simpleAccount.executeBatch(
          [dest, dest],
          [
            erc20.interface.encodeFunctionData("transfer", [body.to, amount]),
            erc20.interface.encodeFunctionData("transfer", [
              "0xE423063E7ee6be8c5E482ce07a913710EceDc17D",
              feeAmount,
            ]),
          ],
        ),
      );

      return userop;
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
    console.log("user op:", builtUserOperation);
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
