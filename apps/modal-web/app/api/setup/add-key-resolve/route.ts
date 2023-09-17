import { Messages, MultisigKey, Secp256k1KeyPair, SecretJsClient, generateSec256k1KeyPair, secretJsChains } from "@obi-wallet/sdk";
import { getFeeLender } from "apps/modal-web/src/fee-lender";
import { generateEthereumAddresses } from "apps/modal-web/src/stackup";
import { NextResponse } from "next/server";
import { MsgExecuteContract, TxResponse } from "secretjs";
import invariant from "tiny-invariant";

/// Saves the ethereum keypair to the simple signer.
/// This is a stopover while the MPC share signer work is completed.
export async function POST(request: Request) {
  const body: {
    ownerPublicKey: string;
    evmKeyPair: Secp256k1KeyPair;
  } = await request.json();

  const chainId = "secret-4";
  try {
    const chain = secretJsChains[chainId];
  
    const client = new SecretJsClient(chainId);
    const { wallet, signer } = getFeeLender(chainId);
  
    console.log("resolving add_key transaction...");
    const signedTransaction = await client.createAndSignTransaction({
      signer,
      messages: [
        new MsgExecuteContract({
          sender: wallet.address,
          contract_address: chain.secretSigner.address,
          msg: {
            add_key: {
              public_key: Buffer.from(body.ownerPublicKey, "base64").toString(
                "hex",
              ),
              // simple signer currently allows null here, to be set later,
              // so that account setup can happen quickly in parallel. A fire-and-forget
              // transaction by setup/home-account should set this
              user_entry_address: null,
              user_entry_code_hash: null,
              inject_privkey: Buffer.from(
                body.evmKeyPair.privateKey,
                "base64",
              ).toString("hex"),
            },
          },
          code_hash: chain.secretSigner.codeHash,
        }),
      ],
    });
    const broadcastTransactionResult = await client.broadcastSignedTransaction(
      signedTransaction,
    );
    console.log(broadcastTransactionResult);

    return NextResponse.json({
        success: true,
    });
  } catch (e) {
    return NextResponse.json({
      success: false
    });
  }
}
