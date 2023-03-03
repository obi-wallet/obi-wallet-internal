import { randomBytes } from "crypto";
import secp256k1 from "secp256k1";

export function generateSec256k1KeyPair() {
  const privateKeyBuffer = randomBytes(32);
  const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);

  const privateKey = Buffer.from(privateKeyBuffer).toString("base64");
  const publicKey = Buffer.from(publicKeyBuffer).toString("base64");

  return {
    privateKey,
    publicKey,
  };
}
