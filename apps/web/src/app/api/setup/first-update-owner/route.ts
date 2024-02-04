import { getFeeLender } from "@/lib/fee-lender";
import {
  Messages,
  MultisigKey,
  SecretJsClient,
  SecretJsChains,
  SecretJsChainIds,
  SecretJsChainId,
} from "@obi-wallet/sdk";
import { NextResponse } from "next/server";
import { MsgSend, TxResponse } from "secretjs";
import invariant from "tiny-invariant";

export interface FirstUpdateOwnerRequestBody {
  owner: MultisigKey;
  ownerAddress: string;
  homeAccountAddress: string;
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
  invariant(wallet.address, "no fee lender wallet address");

  const userEntryCodeHash = await client.withSecretNetworkClient(
    async (secretNetworkClient) => {
      const info = await secretNetworkClient.query.compute.contractInfo({
        contract_address: body.homeAccountAddress,
      });
      const response = await secretNetworkClient.query.compute.codeHashByCodeId(
        {
          // @ts-expect-error Secret Network SDK types are wrong
          code_id: info.contract_info.code_id,
        },
      );
      return response.code_hash;
    },
  );

  const userAccountAddress: UserAccountAddress =
    await client.withSecretNetworkClient(async (client) => {
      return await client.query.compute.queryContract({
        contract_address: body.homeAccountAddress,
        code_hash: userEntryCodeHash,
        query: { user_account_address: {} },
      });
    });

  const owner: { legacy_owner: string } = await client.withSecretNetworkClient(
    async (client) => {
      return await client.query.compute.queryContract({
        contract_address: userAccountAddress.user_account_address,
        code_hash: userAccountAddress.user_account_code_hash,
        query: { legacy_owner: {} },
      });
    },
  );

  // Make this request idempotent by checking if the owner has already been set
  if (owner.legacy_owner === body.ownerAddress) {
    return NextResponse.json({
      success: true,
    });
  }

  const message = messagesSdk.getFirstUpdateWalletMessage(
    body.owner,
    body.ownerAddress,
    userAccountAddress.user_account_address,
    userAccountAddress.user_account_code_hash,
    "",
    "",
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
      success: false,
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
    const homeAccountAddress = matchingLogs?.[1]?.value;
    invariant(homeAccountAddress, "Contract address not found");
    return NextResponse.json({
      success: true,
      ownerAddress: body.ownerAddress,
      homeAccountAddress,
      txResult,
      lenderIndex,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      ownerAddress: body.ownerAddress,
      homeAccountAddress: "PARSE ERROR",
      txResult: broadcastTransactionResult,
      lenderIndex: 0,
    });
  }
}
