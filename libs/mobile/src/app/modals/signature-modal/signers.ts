import {
  KeyType,
  MultisigKey,
  Secp256k1PrivateKeySigner,
} from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

import { getBiometricsPrivateKey } from "../../biometrics";
import { getNFCPrivateKey } from "../../nfc";

export async function createDeviceKeySigner({
  multisigKey,
}: {
  multisigKey: MultisigKey;
}) {
  const deviceKey = multisigKey.getUsableKeyOfType(KeyType.Device);
  invariant(deviceKey, "Expected device key to exist.");
  const privateKey = await getBiometricsPrivateKey({
    publicKey: deviceKey.publicKey.value,
  });
  return new Secp256k1PrivateKeySigner(privateKey);
}

export async function createNfcKeySigner({
  multisigKey,
  demoMode,
  parsed,
}: {
  multisigKey: MultisigKey;
  demoMode: boolean;
  parsed: string;
}) {
  const nfcKey = multisigKey.getUsableKeyOfType(KeyType.Nfc);
  invariant(nfcKey, "Expected NFC key to exist.");
  const privateKey = await getNFCPrivateKey({
    demoMode,
    parsed,
    boostEntropy: true,
    localEntropy: nfcKey.payload.localEntropy,
  });
  return new Secp256k1PrivateKeySigner(privateKey);
}

export async function createCloudKeySigner({
  multisigKey,
}: {
  multisigKey: MultisigKey;
}) {
  const cloudKey = multisigKey.getUsableKeyOfType(KeyType.Cloud);
  invariant(cloudKey, "Expected cloud key to exist.");
  return new Secp256k1PrivateKeySigner(cloudKey.payload.privateKey);
}
