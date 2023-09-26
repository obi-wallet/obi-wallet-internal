import {
  Messages,
  MultisigKey,
  SecretJsClient,
  SecretJsChains,
  SecretJsChainIds,
  SecretJsChainId,
} from "@obi-wallet/sdk";
import { getFeeLender } from "apps/modal-web/src/fee-lender";
import { NextResponse } from "next/server";
import { MsgSend, TxResponse } from "secretjs";
import invariant from "tiny-invariant";

export interface FirstUpdateOwnerRequestBody {
  owner: MultisigKey;
  ownerAddress: string;
  homeAccountAddress: string;
  evmUserContractAddress: string;
  evmSigningAddress: string;
  ownerIndex: number;
}

export interface UserAccountAddress {
  user_account_address: string;
  user_account_code_hash: string;
}

/// Calls first_update_owner to update the pre-created account's owner to
/// the user's multisig key
export async function POST(request: Request) {
  const body: FirstUpdateOwnerRequestBody = await request.json();
  const chainId: SecretJsChainId = SecretJsChainIds.MAINNET;

  console.log("async funding multisig (for later)...");
  const client = new SecretJsClient(chainId);
  const chain = SecretJsChains[SecretJsChainIds.MAINNET];
  const messagesSdk = Messages.chainId(chainId);
  const lender1 = getFeeLender(chainId);
  const sendMessage = new MsgSend({
    from_address: lender1.wallet.address,
    to_address: body.ownerAddress,
    amount: [
      {
        amount: "100",
        denom: "uscrt",
      },
    ],
  });
  const lendSignedTransaction = await client.createAndSignTransaction({
    signer: lender1.signer,
    messages: [sendMessage],
  });
  // fire and forget
  const _lendBroadcastTransactionResult = client.broadcastSignedTransaction(
    lendSignedTransaction,
  );

  console.log("setup/first-update-owner setting up...");
  // old lender from before, which is the only account capable of
  // updating owner, even with "magic" first_update_owner
  const { wallet, signer, lenderIndex } = getFeeLender(
    chainId,
    body.ownerIndex,
  );

  console.log("setup/first-update-owner creating message...");
  invariant(wallet.address, "no fee lender wallet address");
  const userAccountAddress: UserAccountAddress =
    await client.withSecretNetworkClient(async (client) => {
      return await client.query.compute.queryContract({
        contract_address: body.homeAccountAddress,
        code_hash: chain.userEntry.codeHash,
        query: { user_account_address: {} },
      });
    });
  const message = messagesSdk.getFirstUpdateWalletMessage(
    body.owner,
    body.ownerAddress,
    userAccountAddress.user_account_address,
    body.evmUserContractAddress,
    body.evmSigningAddress,
    wallet.address,
  );
  console.log(
    "setup/first-update-owner attempting message: " + JSON.stringify(message),
  );
  console.log("setup/first-update-owner creating transaction...");
  const signedTransaction = await client.createAndSignTransaction({
    signer,
    messages: [message],
  });
  const broadcastTransactionResult =
    await client.broadcastSignedTransaction(signedTransaction);
  console.log(broadcastTransactionResult);

  if (!broadcastTransactionResult.success) {
    return NextResponse.json({
      ownerAddress: body.owner.address,
      homeAccountAddress: "TX FAILED",
      txResult: broadcastTransactionResult,
      lenderIndex: 0,
    });
  }

  const txResult = broadcastTransactionResult.rawResult as TxResponse;
  try {
    invariant(txResult.arrayLog, "No log found");
    // TODO: zod
    const _accountLogicAddress = txResult.arrayLog?.find((log) => {
      return log.type === "instantiate" && log.key === "contract_address";
    })?.value;
    const matchingLogs = txResult.arrayLog?.filter((log) => {
      return log.type === "instantiate" && log.key === "contract_address";
    });
    const homeAccountAddress =
      matchingLogs && matchingLogs.length > 1
        ? matchingLogs[1].value
        : undefined;

    invariant(homeAccountAddress, "Contract address not found");
    return NextResponse.json({
      ownerAddress: body.ownerAddress,
      homeAccountAddress,
      txResult,
      lenderIndex,
    });
  } catch (e) {
    return NextResponse.json({
      ownerAddress: body.ownerAddress,
      homeAccountAddress: "PARSE ERROR",
      txResult: broadcastTransactionResult,
      lenderIndex: 0,
    });
  }
}
