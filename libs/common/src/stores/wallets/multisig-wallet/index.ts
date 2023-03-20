import {
  AbstractSerialized,
  FlexAccount as FlexAccountSdk,
  SinglesigWallet as SinglesigWalletSdk,
} from "@obi-wallet/sdk";

export type FlexAccount = AbstractSerialized<typeof FlexAccountSdk>;
export type SinglesigWallet = AbstractSerialized<typeof SinglesigWalletSdk>;
