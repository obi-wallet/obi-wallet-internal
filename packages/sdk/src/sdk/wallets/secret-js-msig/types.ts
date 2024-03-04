import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";

export enum KeyType {
  Cloud = "cloud",
  Device = "device",
  Email = "email",
  EmailRecovery = "email-recovery",
  Nfc = "nfc",
  Phone = "phone",
  Social = "social",
  Unity = "unity",
  ZAuth = "z-auth",
  Telegram = "telegram",
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
