import { create, get } from "@github/webauthn-json";
import { Encoding, Utf8EncodedString } from "@obi-wallet/encoding";
import { serialize } from "@obi-wallet/sdk-json";
import {
  Sec256k1PrivateKey,
  Secp256k1KeyPair,
} from "@obi-wallet/sdk-secp256k1";
import type { CredentialDeviceType } from "@simplewebauthn/typescript-types";

import { Secp256k1PrivateKeySigner } from "../signers/sec256k1-private-key";

const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";
// Max valid secp256k1 private key value
const SECP256K1_MAX = BigInt(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140",
);

type AttestationFormat =
  | "fido-u2f"
  | "packed"
  | "android-safetynet"
  | "android-key"
  | "tpm"
  | "apple"
  | "none";

interface EncodedDevicePublicKey {
  aaguid: string;
  devicePubKey: string;
  scope: number;
  nonce?: string;
  fmt?: AttestationFormat;
  attStmt?: {
    sig?: string;
    x5c?: string[];
    response?: string;
    alg?: number;
    ver?: string;
    certInfo?: string;
    pubArea?: string;
  };
  sig?: string;
  credentialID: string;
}

interface CustomPublicKeyCredentialCreationOptions {
  challenge: string;
  rp: {
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: "public-key"; // Use a string literal type here
    alg: number;
  }>;
  authenticatorSelection: {
    authenticatorAttachment: "platform" | "cross-platform";
    browser?: string;
    os?: string;
    platform?: string;
    lastUsed?: number;
    credentialDeviceType?: CredentialDeviceType;
    credentialBackedUp?: boolean;
    clientExtensionResults?: unknown;
    devicePubKeys?: EncodedDevicePublicKey[];
    requireResidentKey?: boolean;
    userVerification: "required" | "preferred" | "discouraged";
  };
}

function generateWebAuthnPubKey() {
  try {
    // TODO: refactor here
    let challenge = new Uint8Array(32); // Normally, this challenge is provided by the server.
    if (typeof window !== "undefined") {
      window.crypto.getRandomValues(challenge);
    } else {
      challenge = new Uint8Array(32).fill(0);
    }

    const name = `My Obi Passkey created at ${new Date().toISOString()}`;

    const publicKey: CustomPublicKeyCredentialCreationOptions = {
      challenge: btoa(String.fromCharCode(...challenge)),
      rp: {
        name: "Obi",
        // id: new URL(window.location.origin).hostname,
      },
      user: {
        id: btoa(`${Date.now()}`),
        name,
        displayName: name,
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7, // This indicates the algorithm type (e.g., ES256 for elliptic curve)
        },
        {
          type: "public-key",
          alg: -257, // Value registered by this specification for "RS256"
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        requireResidentKey: true,
      },
    };

    return publicKey;
  } catch (e) {
    console.error("WebAuthn Public Key creation error:", serialize(e));
    throw new Error("Failed to generate WebAuthn Credential");
  }
}

export async function createPasskey(): Promise<Secp256k1KeyPair> {
  const credential = await create({ publicKey: generateWebAuthnPubKey() });
  return await credentialToKeyPair(credential);
}

export async function getPasskey(): Promise<Secp256k1KeyPair> {
  const credential = await get({ publicKey: generateWebAuthnPubKey() });
  return await credentialToKeyPair(credential);
}

export async function credentialToKeyPair(credential: {
  id: string;
}): Promise<Secp256k1KeyPair> {
  const privateKey = await combineKeys(
    DEMO_PRIVATE_KEY,
    Encoding.fromUtf8(Utf8EncodedString.parse(credential.id)).toHex(),
  );
  const webauthnSigner = new Secp256k1PrivateKeySigner(privateKey);
  return {
    publicKey: webauthnSigner.publicKey,
    privateKey: privateKey,
  };
}

// Function to combine the DEMO_PRIVATE_KEY with the credential.id
async function combineKeys(
  demoKey: string,
  credentialKey: string,
): Promise<Sec256k1PrivateKey> {
  const combinedString = demoKey + credentialKey;
  const combinedUint8Array = new Uint8Array(
    combinedString.split("").map((char) => {
      return char.charCodeAt(0);
    }),
  );

  // Hash the combined Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", combinedUint8Array);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => {
      return byte.toString(16).padStart(2, "0");
    })
    .join("");

  // Convert the hash to a BigInt and ensure it's in the valid range
  let privateKeyBigInt = BigInt(`0x${hashHex}`);

  while (privateKeyBigInt >= SECP256K1_MAX) {
    privateKeyBigInt = BigInt(
      `0x${Buffer.from(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(privateKeyBigInt.toString(16)),
        ),
      ).toString("hex")}`,
    );
  }

  // Convert the hex to base64
  return Sec256k1PrivateKey.parse(hexToBase64(privateKeyBigInt.toString(16)));
}

// Helper function to convert hex to base64
function hexToBase64(hex: string) {
  const byteArray = new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte) => {
      return parseInt(byte, 16);
    }),
  );
  return btoa(String.fromCharCode(...byteArray));
}
