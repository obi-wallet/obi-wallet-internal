import { KeyType, Secp256k1PublicKey } from "@obi-wallet/sdk";

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
  owner: SerializedMultisigKey;
}
