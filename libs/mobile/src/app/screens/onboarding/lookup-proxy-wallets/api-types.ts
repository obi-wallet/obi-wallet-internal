import { KeyType } from "@obi-wallet/common";

export interface SerializedPublicKey {
  type: string;
  value: string;
}

export interface SerializedKey {
  type: KeyType;
  publicKey: SerializedPublicKey;
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
