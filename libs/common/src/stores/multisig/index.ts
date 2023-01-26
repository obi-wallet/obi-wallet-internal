import { MultisigThresholdPubkey } from "@cosmjs/amino";

import {
  Secp256k1PublicKey,
  SerializedBiometricsPayload,
  SerializedCloudPayload,
  SerializedPhoneNumberPayload,
  SerializedProxyAddress,
  SerializedSocialPayload,
  SerializedNFCPayload,
} from "./serialized-data";

export type MultisigThresholdPublicKey = MultisigThresholdPubkey;

export type WithAddress<T> = T & { address: string };

export interface Multisig {
  multisig: WithAddress<{
    publicKey: MultisigThresholdPublicKey;
  }> | null;
  biometrics: WithAddress<SerializedBiometricsPayload> | null;
  phoneNumber: WithAddress<SerializedPhoneNumberPayload> | null;
  social: WithAddress<SerializedSocialPayload> | null;
  cloud: WithAddress<SerializedCloudPayload> | null;
  nfc: WithAddress<SerializedNFCPayload> | null;
  email: null;
}

export type MultisigKey = keyof Omit<Multisig, "multisig">;

export enum MultisigState {
  LOADING = "Loading",
  EMPTY = "Empty",
  READY = "Ready",
  OUTDATED = "Outdated",
  INITIALIZED = "Initialized",
}

export * from "./serialized-data";

export interface ProxyWallet {
  proxyAddress: SerializedProxyAddress;
  admin: {
    biometrics: Secp256k1PublicKey;
    phoneNumber: Secp256k1PublicKey;
    social?: Secp256k1PublicKey;
    nfc?: Secp256k1PublicKey;
  };
}
