import { Sha256 } from "@cosmjs/crypto/build/sha";
import { Chain } from "@obi-wallet/common";
import { QueryClient } from "@tanstack/react-query";
import { randomBytes } from "crypto";
import fetch from "isomorphic-unfetch";
import NfcManager, {
  Ndef,
  RegisterTagEventOpts,
  TagEvent,
} from "react-native-nfc-manager";
import secp256k1 from "secp256k1";

import { prepareWalletAndSign } from "../secp256k1";

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
  // hash - can't boost yet or brute forcing will require remote calls for every attempt
  // todo: consider the vulnerability that a compromised endpoint could now try to brute force
  // though doing so is potentially just burning money as
  // 1) perhaps the NFC data has far too much entropy to brute force, and
  // 2) finding a valid result is unlikely to pay out, just compromise 1 key
  // Still, we should at some point find a solution
  const hashed = new Sha256(Buffer.from(parsed));
  const privateKeyBuffer = hashed.digest();
  const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);
  // now boost with remote secret
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
  chainId,
  queryClient,
}: {
  payload: Uint8Array;
  demoMode: boolean;
  parsed: string;
  boostEntropy: boolean;
  localEntropy: string;
  chainId: Chain;
  queryClient: QueryClient;
}) {
  const { publicKey, privateKey } = await getNFCKeyPair({
    demoMode,
    parsed,
    boostEntropy,
    localEntropy,
  });
  return await prepareWalletAndSign({
    publicKey,
    privateKey,
    payload,
    chainId,
    queryClient,
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

function getYubikeyOTP(parsed: string): string {
  const lookupString = "my.yubico.com/yk/#";
  const urlLoc = parsed.indexOf(lookupString);
  if (urlLoc === -1) {
    return "";
  } else {
    const otpLoc = urlLoc + lookupString.length;
    let endLoc = otpLoc;
    for (let i = otpLoc; i < parsed.length; i++) {
      if (!/^[cbdefghijklnrtuv]*$/.test(parsed.charAt(i))) {
        endLoc = i;
        break;
      }
    }
    console.warn("Parsed substring is " + parsed.substring(otpLoc, endLoc));
    return parsed.substring(otpLoc, endLoc);
  }
}

export function parseNFCData(tag: TagEvent): string {
  const ndefRecords = tag.ndefMessage;
  const parsed = ndefRecords.map(decodeNdefRecord);
  const parsedString = JSON.stringify(parsed);
  const yubikeyOTP = getYubikeyOTP(parsedString);
  if (yubikeyOTP.length > 0) {
    // TODO: more robust yubikey verification is possible, potentially not using OTP
    // or by running a special verification/signing service
    const nonce = randomBytes(32).toString("hex");
    // nonce required to make the request unique
    // TODO: yubico runs api2, api3, api4, api5... add these as backups
    const apiUrl = `https://api.yubico.com/wsapi/2.0/verify?id=1&otp=${yubikeyOTP}&nonce=${nonce}`;
    fetch(apiUrl, {
      method: "GET",
    }).then((response) => {
      console.warn("raw response: ", JSON.stringify(response));
      if (response.status !== 200) {
        throw Error("Yubikey verification failed");
      }
      response.json().then((data) => {
        if (!data.ok) {
          throw Error("Yubikey verification failed");
        }
        if (data.status === "REPLAYED_OTP") {
          throw Error("Yubikey OTP already used");
        }
        if (data.nonce != nonce) {
          throw Error("Mismatched nonce in response");
        }
        if (data.otp != parsed) {
          throw Error("Mismatched OTP in response");
        }
        if (data.status != "OK") {
          throw Error(
            "Instead of OK response from Yubikey, received: " + data.status
          );
        }
        /// TODO
        /* if (!checkYubihash(data.h)) {
          throw Error("Hash check failed");
        } */
      });
      console.warn("Yubikey verification passed!");
    });
    return yubikeyOTP.slice(0, -32);
  } else {
    return JSON.stringify(parsed);
  }
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
