import { Sha256 } from "@cosmjs/crypto/build/sha";
import { randomBytes } from "crypto";
import { Alert } from "react-native";
import * as Keychain from "react-native-keychain";
import secp256k1 from "secp256k1";

import { prepareWalletAndSign } from "../secp256k1";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

export async function getNFCPublicKey({
  demoMode, parsed
}: {
  demoMode: boolean;
  parsed: string;
}) {
  const { publicKey } = await getNFCKeyPair({ demoMode, parsed });
  return publicKey;
}

export async function getNFCPrivateKey({
  demoMode, parsed
}: {
  demoMode: boolean;
  parsed: string;
}) {
  const { privateKey } = await getNFCKeyPair({ demoMode, parsed });
  return privateKey;
}

export async function getNFCKeyPair({
  demoMode, parsed
}: {
  demoMode: boolean;
  parsed: string;
}) {
  if (demoMode) {
    return {
      privateKey: DEMO_PRIVATE_KEY,
      publicKey: DEMO_PUBLIC_KEY,
    };
  }
  const hashed = new Sha256(Buffer.from(parsed));
  const privateKeyBuffer = hashed.digest();
  const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);

  const privateKey = Buffer.from(privateKeyBuffer).toString("base64");
  const publicKey = Buffer.from(publicKeyBuffer).toString("base64");

  return { privateKey, publicKey };
}

export async function createNFCSignature({
  payload,
  demoMode,
  parsed,
}: {
  payload: Uint8Array;
  demoMode: boolean;
  parsed: string;
}) {
  const { publicKey, privateKey } = await getNFCKeyPair({ demoMode, parsed });
  return await prepareWalletAndSign({
    publicKey,
    privateKey,
    payload,
  });
}
