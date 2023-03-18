import { useTheme } from "@emotion/react/dist/emotion-react.cjs";
import { GatekeeperConfig } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { View } from "react-native";

import { AccountsOverviewScreen } from "./accounts-overview";
import { AccountsRoute, AccountsStack } from "./accounts-stack";
import { AddAccountScreen } from "./add-account";
import { CreateBeneficiaryAccountScreen } from "./create-beneficiary-account";
import { CreateFlexAccountScreen } from "./create-flex-account";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { ImportKeplrAccountScreen } from "./import-keplr-account";
import { ImportLegacyAccountScreen } from "./import-legacy-account";
import { ImportStationAccountScreen } from "./import-station-account";
import { useMultisigWallet, useStore } from "../../app/stores";

export const AccountsScreen = observer(function AccountsScreen() {
  const { draftsStore } = useStore();
  const wallet = useMultisigWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  useEffect(() => {
    if (!draft) {
      draftsStore.create({
        id: draftId,
        original: wallet.gatekeeperConfig,
      });
    }
  }, [draft, draftId, draftsStore, wallet.gatekeeperConfig]);

  const theme = useTheme();

  if (!draft) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }

  return (
    <AccountsStack.Navigator
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          fontFamily: "Inter",
        },
      }}
    >
      <AccountsStack.Screen
        name={AccountsRoute.AccountsOverview}
        component={AccountsOverviewScreen}
      />
      <AccountsStack.Screen
        name={AccountsRoute.AddAccount}
        component={AddAccountScreen}
      />
      <AccountsStack.Screen
        name={AccountsRoute.CreateFlexAccount}
        component={CreateFlexAccountScreen}
      />
      <AccountsStack.Screen
        name={AccountsRoute.CreateBeneficiaryAccount}
        component={CreateBeneficiaryAccountScreen}
      />
      <AccountsStack.Screen
        name={AccountsRoute.ImportLegacyAccount}
        component={ImportLegacyAccountScreen}
      />
      <AccountsStack.Screen
        name={AccountsRoute.ImportStationAccount}
        component={ImportStationAccountScreen}
      />
      <AccountsStack.Screen
        name={AccountsRoute.ImportKeplrAccount}
        component={ImportKeplrAccountScreen}
      />
    </AccountsStack.Navigator>
  );
});
