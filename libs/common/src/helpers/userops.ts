import {
  EthTransaction,
  ExtendedWallet,
  SignAndBroadcastTransactionUserInteraction,
  Wallets,
} from "@obi-wallet/sdk";
import { formatUnits } from "ethers";
import * as ethers5 from "ethers5";
import invariant from "tiny-invariant";
import {
  Client,
  IUserOperation,
  Presets,
  UserOperationMiddlewareCtx,
} from "userop";

export function addEllipsisInMiddle(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const removeCount = Math.ceil((text.length - maxLength) / 2);
  const midPoint = Math.ceil(text.length / 2);
  const start = text.slice(0, midPoint - removeCount);
  const end = text.slice(-midPoint + removeCount);

  return `${start}...${end}`;
}

export async function signAndBroadcastUserOp(
  wallets: Wallets | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
) {
  const client = await Client.init(
    "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
    {
      entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      overrideBundlerRpc:
        "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
    },
  );
  let response;
  const userOp = await signAndGetUserOp(wallets, data);
  try {
    console.log("starting exec of userop...");
    response = await client.execUserOperation(userOp);
  } catch (e) {
    console.error(e);
    // recovery bit workaround, as simple signer can't calculate it
    const signature = userOp.signature as string;
    userOp.signature = `${signature.substring(
      0,
      userOp.signature.length - 2,
    )}1b`;
    console.log("starting exec of userop with alternate recovery bit...");
    response = await client.execUserOperation(userOp);
  }
  return response;
}

export async function signAndGetUserOp(
  wallets: Wallets | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
) {
  invariant(wallets, "no wallets");
  console.log(
    "current wallet retrieved: " + JSON.stringify(wallets.currentWallet),
  );
  console.log(
    "wallet signing address is: " + wallets.currentWallet?.evmSigningAddress,
  );
  console.log("payload", data.payload);

  // we need to make the user operation - which might ask for a signature
  // tbd on handling this
  console.log("setting up paymaster middleware...");
  const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
    "https://api.stackup.sh/v1/paymaster/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
    { type: "payg" },
  );
  console.log("setting up client...");
  const client = await Client.init(
    "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
    {
      entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      overrideBundlerRpc:
        "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
    },
  );
  invariant(
    wallets.currentWallet?.evmSigningAddress,
    "no signing address provided",
  );
  invariant(
    wallets.currentWallet.evmSigningAddress,
    "no signing address provided",
  );
  // This likely won't actually be used for network calls
  console.log("setting up dummy provider...");
  const dummyProvider = new ethers5.providers.JsonRpcProvider(
    "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
  );
  console.log("setting up extendedSigner...");
  const extendedSigner = new ExtendedWallet(
    wallets.currentWallet.evmSigningAddress,
    dummyProvider,
    wallets.currentWallet.owner,
    wallets.currentWallet.proxyAddress,
  );
  console.log("building simpleAccount...");
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    extendedSigner,
    "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
    { paymasterMiddleware },
  );

  invariant(data.payload[0].eth, "no user op inputted");
  console.log("in buildUserOperation()");
  console.log("data.payload.eth is: " + JSON.stringify(data.payload[0].eth));
  const ethTx = new EthTransaction(data.payload[0].eth!);

  const userOp: IUserOperation = await client.buildUserOperation(
    simpleAccount.execute(ethTx.contractAddress, 0, ethTx.getEncodedCallData()),
  );

  // signer contract should automatically prepend here
  const ctx: UserOperationMiddlewareCtx = new UserOperationMiddlewareCtx(
    userOp,
    "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    421613,
  );
  console.log("user op hash is: " + ctx.getUserOpHash());
  const amount = formatUnits(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data.payload[0].eth as any).params[1]
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.payload[0].eth as any).params[1]
      : 0,
    18,
  );
  const hint =
    ethTx.functionName === "transfer"
      ? "Transferring " +
        amount +
        " ZTX to " +
        addEllipsisInMiddle(ethTx.params[0] as string, 10)
      : ethTx.functionName +
        " on contract " +
        addEllipsisInMiddle(ethTx.contractAddress, 10);
  console.log("attempting to send in hint: " + hint);
  const interactionObj = {
    messages: [{ hash: ctx.getUserOpHash() }],
    targetChainId: data.payload.targetChainId,
    cancelable: true,
    walletMeta: wallets.currentWallet.meta,
    demoMode: wallets.currentWallet.isDemo,
    autoBroadcast: false,
    // TODO: the modal can verify that the hint corresponds to the actual user op
    // which produces the hash
    hint,
    amount,
  };
  console.log("interaction object is: " + JSON.stringify(interactionObj));

  const signatureResponse =
    await SignAndBroadcastTransactionUserInteraction.start({
      ...interactionObj,
      multisigKey: wallets.currentWallet.owner,
    });

  console.log(
    "changing old sig " +
      userOp.signature +
      " to new " +
      /* eslint-disable @typescript-eslint/no-explicit-any */
      (signatureResponse as any).payload?.transactionHash,
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  userOp.signature = (signatureResponse as any).payload?.transactionHash;
  return userOp;
}
