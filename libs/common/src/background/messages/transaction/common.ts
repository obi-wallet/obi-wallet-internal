import { SerializedMultisigKey, WalletMeta } from "../../../stores";

export interface CommonPayloadWalletMeta {
  readonly walletMeta: WalletMeta;
}

export interface CommonPayloadMultisigKey {
  readonly multisigKey: SerializedMultisigKey;
}

export type CommonPayload = {
  readonly demoMode: boolean;
  readonly cancelable: boolean;
} & (CommonPayloadMultisigKey | CommonPayloadWalletMeta);
