/* eslint-disable @typescript-eslint/no-unused-vars */
import { randomBytes } from "crypto";
import type { TagEvent } from "react-native-nfc-manager";
import invariant from "tiny-invariant";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

export async function getNFCPrivateKey({
  demoMode,
  parsed,
  boostEntropy,
  localEntropy,
}: {
  demoMode: boolean;
  parsed: string;
  boostEntropy: boolean;
  localEntropy: string;
}) {
  invariant(false, "getNFCPrivateKey not implemented for web");
  return "";
}

export async function getNFCKeyPair({
  demoMode,
  parsed,
  boostEntropy,
  localEntropy,
}: {
  demoMode: boolean;
  parsed: string;
  boostEntropy: boolean;
  localEntropy: string;
}) {
  invariant(false, "getNFCKeyPair not implemented for web");
  return {
    publicKey: "",
    privateKey: "",
  };
}

export async function checkIsSupported() {
  invariant(false, "checkIsSupported not implemented for web");
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeNdefRecord(record: any) {
  invariant(false, "decodeNdefRecord not implemented for web");
  return ["unknown", "---"];
}

export async function startReading(alertMessage: string) {
  invariant(false, "startReading not implemented for web");
}

export function parseNFCData(tag: TagEvent): string {
  invariant(false, "parseNFCData not implemented for web");
  return "";
}

export function generateLocalEntropy() {
  const localEntropyBytes = randomBytes(3);

  // 24 bits (3 bytes) is probably too much, so let's zero
  // out the first three bits with a bitwise AND.
  // This can be customized as needed, perhaps by device
  // later, to increase/decrease the recovery
  // brute force difficulty. For example, 0b00111111
  // would double the difficulty.

  localEntropyBytes[0] &= 0b00011111;

  return localEntropyBytes.toString("base64");
}
