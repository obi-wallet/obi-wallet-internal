import {
  AbstractSerialized,
  SinglesigWallet as SinglesigWalletSdk,
} from "@obi-wallet/sdk";

export type SinglesigWallet = AbstractSerialized<typeof SinglesigWalletSdk>;
