import {
  AbstractSerialized,
  Beneficiary as BeneficiarySdk,
  FlexAccount as FlexAccountSdk,
  SinglesigWallet as SinglesigWalletSdk,
} from "@obi-wallet/sdk";

export type Beneficiary = AbstractSerialized<typeof BeneficiarySdk>;
export type FlexAccount = AbstractSerialized<typeof FlexAccountSdk>;
export type SinglesigWallet = AbstractSerialized<typeof SinglesigWalletSdk>;
