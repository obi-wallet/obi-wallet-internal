import { MultisigKey, Serialized, WalletMeta } from "@obi-wallet/sdk";

export interface CommonPayloadWalletMeta {
  readonly walletMeta: WalletMeta;
}

export interface CommonPayloadMultisigKey {
  readonly multisigKey: Serialized<typeof MultisigKey>;
}

export type CommonPayload = {
  readonly demoMode: boolean;
  readonly cancelable: boolean;
} & (CommonPayloadMultisigKey | CommonPayloadWalletMeta);
