import {
  MultisigWallet,
  ObservableFlexAccount,
  Sdk,
  generateSec256k1KeyPair,
} from "@obi-wallet/sdk";
import { Alert } from "react-native";

import { Draft } from "../stores";

export async function createSessionKey({
  wallet, maxSpend, isLogin,
}: {
  wallet: MultisigWallet;
  maxSpend: number;
  isLogin?: boolean;
}) {
  const { publicKey, privateKey } = generateSec256k1KeyPair();
  const address = Sdk.chainId(
    wallet.chainId
  ).transactions.getAddressOfPublicKey(publicKey);
  const draft = new Draft({
    original: wallet.gatekeeperConfig,
  });
  const observableFlex = ObservableFlexAccount.create({
    type: "flex-account",
    meta: {
      icon: "",
      name: "",
    },
    autoSign: null,
    spendLimit: {
      amount: maxSpend,
      period: { days: 1 },
    },
    address,
    publicKey,
    privateKey,
  });

  draft.value.upsertFlexAccount(observableFlex);
  const response = await wallet.updateGatekeeperConfig({
    newGatekeeperConfig: draft.value,
    isLogin,
  });
  if (response.approved) {
    if (response.payload.success) {
      console.log(wallet.gatekeeperConfig.flexAccounts[0].toJSON());
    } else {
      Alert.alert("Error", response.payload.rawLog ?? "Unknown error");
    }
  }
}
