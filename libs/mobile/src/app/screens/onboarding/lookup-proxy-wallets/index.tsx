import { observer } from "mobx-react-lite";

import { useRootNavigation } from "../../../root-stack";
import { useMultisigWallet } from "../../../stores";
import { OnboardingRoute } from "../onboarding-stack";
import { Lookup } from "./lookup";

export const LookupProxyWallets = observer(() => {
  const wallet = useMultisigWallet();
  const { navigate } = useRootNavigation();
  const publicKey = wallet.nextAdmin.phoneNumber?.publicKey;

  if (!publicKey) return null;

  return (
    <Lookup
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
