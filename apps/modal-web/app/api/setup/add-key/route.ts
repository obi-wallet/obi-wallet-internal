import { generateSec256k1KeyPair } from "@obi-wallet/sdk";
import { generateEthereumAddresses } from "apps/modal-web/src/stackup";
import { NextResponse } from "next/server";

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
    // fire off, don't wait for success
    const _response = fetch("/api/setup/add-key-resolve", {
      method: "POST",
      body: JSON.stringify({
        ownerPublicKey: body.ownerPublicKey,
        evmKeyPair,
      }),
    });

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
