import { EthereumAccount } from "@obi-wallet/headless-ui";
import {
  Contract,
  JsonRpcProvider,
  parseUnits,
  Signer,
  SigningKey,
  Wallet,
} from "ethers";
import { NextResponse } from "next/server";
import { Client, Presets } from "userop";

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
    account: EthereumAccount;
    to: string;
    token: {
      id: string;
      rawAmount: string;
    };
  } = await request.json();

  const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
    config.paymaster.rpcUrl!,
    config.paymaster.context,
  );
  const client = await Client.init(config.rpcUrl!);
  const amount = parseUnits(body.token.rawAmount, 0);
  const signingKey = new SigningKey(
    Buffer.from(body.account.keyPair.privateKey, "base64"),
  );
  const signer: Signer = new Wallet(signingKey);
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    // @ts-expect-error this should be fine
    signer,
    config.rpcUrl,
    { paymasterMiddleware },
  );

  async function handleUserOperation() {
    if (body.token.id === "eth") {
      return await client.sendUserOperation(
        simpleAccount.execute(body.to, amount, "0x"),
        {
          dryRun: false,
        },
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
      return await client.sendUserOperation(
        simpleAccount.execute(
          await erc20.getAddress(),
          0,
          erc20.interface.encodeFunctionData("transfer", [body.to, amount]),
        ),
        {
          dryRun: false,
        },
      );
    }
  }

  try {
    const userOperation = await handleUserOperation();
    console.log("userOp", userOperation);
    const event = await userOperation.wait();
    console.log("event", event);
    return NextResponse.json(event);
  } catch (e) {
    console.log("error", e);
    return NextResponse.json(e);
  }
}
