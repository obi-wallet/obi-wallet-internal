import crypto from "crypto";
import { NextResponse } from "next/server";
import invariant from "tiny-invariant";

export interface EmailRecoveryRequestBody {
  recoveryLink: string;
}
export async function POST(request: Request) {
  const body: EmailRecoveryRequestBody = await request.json();

  try {
    const { recoveryLink } = body;

    const encryptedDataString = recoveryLink.replace(
      "https://wallet.obimoney.games/ztx/",
      "",
    );

    const privateKeyPem = process.env.EMAIL_SHIELD;
    invariant(privateKeyPem, "no key shield decryptor");

    // Convert base64 encoded data back to Buffer
    const encryptedBuffer = Buffer.from(encryptedDataString, "base64");

    const decryptedString = decryptWithPrivateKey(
      privateKeyPem,
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

function decryptWithPrivateKey(
  privateKeyPem: string,
  encryptedData: Buffer,
): string {
  const decryptedBuffer = crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    encryptedData,
  );
  return decryptedBuffer.toString("utf8");
}
