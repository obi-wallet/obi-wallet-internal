import { Secp256k1PublicKey } from "../../../../src/keys";

export enum KeyType {
  Device = "device",
  Phone = "phone",
  Social = "social",
  Nfc = "nfc",
  Cloud = "cloud",
  Email = "email",
  EmailRecovery = "email-recovery",
  Unity = "unity",
  ZAuth = "z-auth",
}

export interface SerializedPublicKey {
  type: string;
  value: string;
}

export interface SerializedKey {
  type: KeyType;
  publicKey: Secp256k1PublicKey;
}

export interface SerializedMultisigKey {
  threshold: string;
  keys: SerializedKey[];
}

export interface SerializedProxyWallet {
  proxyAddress: {
    address: string;
    codeId: number;
  };
  evmUserContractAddress: string;
  evmSigningAddress: string | undefined;
  owner: SerializedMultisigKey;
}
