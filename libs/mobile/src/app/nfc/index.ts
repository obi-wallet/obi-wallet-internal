import { Sha256 } from "@cosmjs/crypto/build/sha";
import fetch from "isomorphic-unfetch";
import NfcManager, {
  Ndef,
  RegisterTagEventOpts,
} from "react-native-nfc-manager";
import secp256k1 from "secp256k1";

import { prepareWalletAndOptionallySign } from "../secp256k1";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

export async function getNFCPublicKey({
  demoMode,
  parsed,
  boostEntropy,
  localEntropy,
}: {
  demoMode: boolean;
  boostEntropy: boolean;
  parsed: string;
  localEntropy: string;
}) {
  const { publicKey } = await getNFCKeyPair({
    demoMode,
    parsed,
    boostEntropy,
    localEntropy,
  });
  return publicKey;
}

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
  const { privateKey } = await getNFCKeyPair({
    demoMode,
    parsed,
    boostEntropy,
    localEntropy,
  });
  return privateKey;
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
  console.warn(
    "Getting NFC keypair with: " +
      demoMode +
      " " +
      parsed +
      " " +
      boostEntropy +
      " " +
      localEntropy
  );
  if (demoMode) {
    return {
      privateKey: DEMO_PRIVATE_KEY,
      publicKey: DEMO_PUBLIC_KEY,
    };
  }
  /// boost with local secret
  const hashed = new Sha256(Buffer.from(parsed + localEntropy));
  const privateKeyBuffer = hashed.digest();
  const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);
  /// now boost with remote secret
  if (boostEntropy) {
    const response = await fetch(
      "https://4a1uedngw7.execute-api.us-east-1.amazonaws.com",
      {
        method: "POST",
        body: privateKeyBuffer,
      }
    );
    if (response.status !== 200) {
      console.warn("Entropy boost failed");
      console.warn(response);
      // todo: implement retry
      throw Error("Entropy boost failed");
    }
    const { salted } = await response.json();
    if (response.ok) {
      const rehashed = new Sha256(Buffer.from(salted + localEntropy));
      const saltedPrivateKeyBuffer = rehashed.digest();
      const saltedPublicKeyBuffer = secp256k1.publicKeyCreate(
        saltedPrivateKeyBuffer
      );

      const privateKey = Buffer.from(saltedPrivateKeyBuffer).toString("base64");
      const publicKey = Buffer.from(saltedPublicKeyBuffer).toString("base64");
      return { privateKey, publicKey };
    } else {
      // todo: implement retry
      console.warn("Entropy boost failed");
      console.warn(response);
      throw Error("Entropy boost failed");
    }
  } else {
    const privateKey = Buffer.from(privateKeyBuffer).toString("base64");
    const publicKey = Buffer.from(publicKeyBuffer).toString("base64");
    return { privateKey, publicKey };
  }
}

export async function createNFCSignature({
  payload,
  demoMode,
  parsed,
  boostEntropy,
  localEntropy,
}: {
  payload: Uint8Array;
  demoMode: boolean;
  parsed: string;
  boostEntropy: boolean;
  localEntropy: string;
}) {
  const { publicKey, privateKey } = await getNFCKeyPair({
    demoMode,
    parsed,
    boostEntropy,
    localEntropy,
  });
  return await prepareWalletAndOptionallySign({
    publicKey,
    privateKey,
    payload,
  });
}

export async function checkIsSupported() {
  const deviceIsSupported = await NfcManager.isSupported();

  if (deviceIsSupported) {
    await NfcManager.start();
  }

  return deviceIsSupported;
}

export function decodeNdefRecord(record: any) {
  if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
    return ["text", Ndef.text.decodePayload(record.payload)];
  } else if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
    return ["uri", Ndef.uri.decodePayload(record.payload)];
  }

  return ["unknown", "---"];
}

export async function startReading(alertMessage: string) {
  const options: RegisterTagEventOpts = {
    alertMessage: alertMessage,
  };
  await NfcManager.registerTagEvent(options);
}

export async function parseNFCData(tag: any): Promise<string> {
  const ndefRecords = await tag.ndefMessage;
  const parsed = await ndefRecords.map(decodeNdefRecord);
  return JSON.stringify(parsed);
}
