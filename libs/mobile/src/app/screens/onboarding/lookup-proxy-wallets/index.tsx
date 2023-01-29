import { isTerraMultisigWallet } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

import { Lookup } from "./lookup";
import { useRootNavigation } from "../../../root-stack";
import { useMultisigWallet } from "../../../stores";
import { OnboardingRoute } from "../onboarding-stack";

export const LookupProxyWallets = observer(function LookupProxyWallets() {
  const wallet = useMultisigWallet();
  const { navigate } = useRootNavigation();
  const publicKey = wallet.nextAdmin.phoneNumber?.publicKey;

  if (!publicKey) return null;

  return (
    <Lookup
      chainId={isTerraMultisigWallet(wallet) ? "phoenix-1" : "juno-1"}
      publicKey={publicKey.value}
      onCancel={() => {
        navigate(OnboardingRoute.CreateMultisigPhoneNumber);
      }}
      onSelect={async (recoveryWallet) => {
        await wallet.setWalletInRecovery(recoveryWallet);
        navigate(OnboardingRoute.RecoverMultisig);
      }}
    />
  );
});
