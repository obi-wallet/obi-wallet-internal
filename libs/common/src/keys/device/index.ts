import {
  generateSec256k1KeyPair,
  KeySubclassTypeMapping,
  KeyType,
  Secp256k1KeyPair,
} from "@obi-wallet/sdk";

import { getBiometricsPrivateKey } from "./legacy";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

export function createDeviceKeyPair(demoMode: boolean): Secp256k1KeyPair {
  if (demoMode) {
    return {
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: DEMO_PUBLIC_KEY,
      },
      privateKey: DEMO_PRIVATE_KEY,
    };
  }

  return generateSec256k1KeyPair();
}

export async function getDevicePrivateKey(
  key: KeySubclassTypeMapping[KeyType.Device],
): Promise<string | null> {
  if (key.payload.privateKey) return key.payload.privateKey;

  try {
    const privateKey = await getBiometricsPrivateKey({
      publicKey: key.publicKey.value,
    });
    key.setSerialized({
      type: KeyType.Device,
      payload: {
        publicKey: key.publicKey,
        privateKey,
      },
    });
    return privateKey;
  } catch (e) {
    return null;
  }
}
