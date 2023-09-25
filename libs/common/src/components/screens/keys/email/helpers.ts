import secp256k1 from "secp256k1";

export function isPrivateKey(text: string): boolean {
  try {
    return secp256k1.privateKeyVerify(
      new Uint8Array(Buffer.from(text, "base64")),
    );
  } catch (e) {
    return false;
  }
}

export function findRecoveryLink(text: string): string {
  return text.trim();
}
