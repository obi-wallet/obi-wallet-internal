import { SecretJsClient, generateSec256k1KeyPair, secretJsChains } from "@obi-wallet/sdk";
import { getFeeLender } from "apps/modal-web/src/fee-lender";
import { generateEthereumAddresses } from "apps/modal-web/src/stackup";
import { NextResponse } from "next/server";
import { MsgExecuteContract } from "secretjs";

/// Creates an ethereum key for the user and saves it to the simple signer.
/// This is a stopover while the MPC share signer work is completed.
export async function POST(request: Request) {
  const body: {
    ownerPublicKey: string;
  } = await request.json();

  try {
    const evmKeyPair = generateSec256k1KeyPair();
    console.log(
      "EVM keypair with pubkey " + evmKeyPair.publicKey.value + " created",
    );
    const { evmSignerAddress, evmUserContractAddress } =
      await generateEthereumAddresses(evmKeyPair);
    console.log("EVM user contract address is " + evmUserContractAddress);
    const chainId = "secret-4";
    const chain = secretJsChains[chainId];

    const client = new SecretJsClient(chainId);
    const { wallet, signer } = getFeeLender(chainId);

    console.log("resolving add_key transaction...");
    console.warn("The add_key pub key used is " + Buffer.from(body.ownerPublicKey, "base64").toString(
      "hex",
    ));
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
                evmKeyPair.privateKey,
                "base64",
              ).toString("hex"),
            },
          },
          code_hash: chain.secretSigner.codeHash,
        }),
      ],
    });
    console.warn(JSON.stringify(signedTransaction));
    const broadcastTransactionResult = await client.broadcastSignedTransaction(
      signedTransaction,
    );
    console.warn(JSON.stringify(broadcastTransactionResult));

    return NextResponse.json({
      success: true,
      publicKey: evmKeyPair.publicKey,
      evmSignerAddress,
      evmUserContractAddress,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
    });
  }
}
