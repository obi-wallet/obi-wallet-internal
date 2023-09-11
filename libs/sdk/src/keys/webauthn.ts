import { MsgSend, Wallet, pubkeyToAddress } from "secretjs";
import invariant from "tiny-invariant";

import { getBiometricsPrivateKey } from "./legacy";
import { Secp256k1KeyPair, generateSec256k1KeyPair } from "./sec256k1";
import { SecretJsClient } from "../clients/secret-js";
import { KeySubclassTypeMapping, KeyType } from "../data-structures/key";
import { Secp256k1PrivateKeySigner } from "../signers/sec256k1-private-key";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";
// Max valid secp256k1 private key value
const SECP256K1_MAX = BigInt(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140",
);

interface CustomPublicKeyCredentialCreationOptions {
  challenge: Uint8Array;
  rp: {
    name: string;
  };
  user: {
    id: Uint8Array;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: "public-key"; // Use a string literal type here
    alg: number;
  }>;
  authenticatorSelection: {
    authenticatorAttachment: "platform";
  };
}

export async function getOrCreateDeviceKeyPair(
  webauthn: boolean,
  create: boolean,
  demoMode: boolean,
): Promise<Secp256k1KeyPair> {
  if (webauthn) {
    try {
      const challenge = new Uint8Array(32); // Normally, this challenge is provided by the server.
      window.crypto.getRandomValues(challenge);

      const publicKey: CustomPublicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: "Obi",
        },
        user: {
          id: new Uint8Array(16),
          name: "My Obi Device Key",
          displayName: "My Obi Device Key",
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7, // This indicates the algorithm type (e.g., ES256 for elliptic curve)
          },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
        },
      };
      let credential;
      if (create) {
        credential = await navigator.credentials.create({ publicKey });
      } else {
        try {
          credential = await navigator.credentials.get({ publicKey });
        } catch (e) {
          credential = await navigator.credentials.create({ publicKey });
          create = true;
        }
      }
      console.log("webauthn credential id: " + JSON.stringify(credential?.id));

      invariant(credential?.id, "Expected credential to have an id");
      const combinedPrivateKey = await combineKeys(
        DEMO_PRIVATE_KEY,
        Buffer.from(credential?.id).toString("hex"),
      );
      const client = new SecretJsClient("secret-4");
      const webauthnSigner = new Secp256k1PrivateKeySigner(combinedPrivateKey);
      console.log("Resulting public key: " + webauthnSigner.publicKey.value);

      /// fund address
      const webauthnAddress = pubkeyToAddress(
        Buffer.from(webauthnSigner.publicKey.value),
      );
      console.log("webauthn Signer address: " + webauthnAddress);
      const { wallet, signer } = await getFeeLender();

      const signedFundTransaction = await client.createAndSignTransaction({
        signer,
        messages: [
          new MsgSend({
            from_address: wallet.address,
            to_address: webauthnAddress,
            amount: [
              {
                denom: "uscrt",
                amount: "25000",
              },
            ],
          }),
        ],
      });
      const broadcastTransactionResult =
        await client.broadcastSignedTransaction(signedFundTransaction);
      console.log(broadcastTransactionResult);

      return {
        publicKey: {
          type: "tendermint/PubKeySecp256k1",
          value: signer.publicKey.value,
        },
        privateKey: combinedPrivateKey,
      };
    } catch (err) {
      console.error("WebAuthn error:", err);
      throw new Error("WebAuthn request rejected");
    }
  } else if (demoMode) {
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

// Function to combine the DEMO_PRIVATE_KEY with the credential.id
const combineKeys = async (
  demoKey: string,
  credentialKey: string,
): Promise<string> => {
  const combinedString = demoKey + credentialKey;
  const combinedUint8Array = new Uint8Array(
    combinedString.split("").map((char) => char.charCodeAt(0)),
  );

  // Hash the combined Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", combinedUint8Array);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  // Convert the hash to a BigInt and ensure it's in the valid range
  let privateKeyBigInt = BigInt(`0x${hashHex}`);
  while (privateKeyBigInt >= SECP256K1_MAX) {
    privateKeyBigInt = BigInt(
      `0x${crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(privateKeyBigInt.toString(16)),
      )}`,
    );
  }

  // Convert the hex to base64
  const privateKeyBase64 = hexToBase64(privateKeyBigInt.toString(16));

  return privateKeyBase64;
};

// Helper function to convert hex to base64
const hexToBase64 = (hex: string) => {
  const byteArray = new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
  return btoa(String.fromCharCode(...byteArray));
};

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

// TODO: mutation with retry
async function getFeeLender() {
  const feeLender = process.env["FEE_LENDER_SECRET_4"] ?? "";
  const feeLenderIndex = Math.floor(Math.random() * 1000);
  const wallet = new Wallet(feeLender, {
    hdAccountIndex: feeLenderIndex,
  });
  const signer = new Secp256k1PrivateKeySigner(
    Buffer.from(wallet.privateKey).toString("base64"),
  );
  return { wallet, signer };
}
