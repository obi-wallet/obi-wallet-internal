import { decryptWithPrivateKey, EncryptionService } from "@obi-wallet/sdk";
// import crypto from "crypto";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";

export async function POST(request: Request) {
  const body: {
    recoveryLink: string;
  } = await request.json();

  try {
    const { recoveryLink } = body;

    const encryptedDataString = recoveryLink.replace(
      "https://wallet.obimoney.games/ztx/",
      "",
    );

    // TODO: work in progress, this is a master key that decrypt user encrypted keys

    const obiEncryptionKey: string = process.env.OBI_EMAIL_ENCRYPTION_KEY;
    // const obiEncryptionKeyBuf = Buffer.from(obiEncryptionKey!, "base64");
    invariant(obiEncryptionKey, "no key shield decryptor");

    // Convert base64 encoded data back to Buffer
    const encryptedBuffer = Buffer.from(encryptedDataString, "base64");

    const decryptedString = decryptWithPrivateKey(
      obiEncryptionKey,
      encryptedBuffer,
    );

    return NextResponse.json({
      decrypted: decryptedString,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Decryption failed",
      },
      { status: 500 },
    );
  }
}
