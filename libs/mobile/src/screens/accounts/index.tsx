import { observer } from "mobx-react-lite";

import { AccountsOverviewScreen } from "./accounts-overview";
import { AccountsRoute, AccountsStack } from "./accounts-stack";
import { AddAccountScreen } from "./add-account";
import { CreateBeneficiaryAccountScreen } from "./create-beneficiary-account";
import { CreateFlexAccountScreen } from "./create-flex-account";
import { ImportKeplrAccountScreen } from "./import-keplr-account";
import { ImportLegacyAccountScreen } from "./import-legacy-account";
import { ImportStationAccountScreen } from "./import-station-account";

export const AccountsScreen = observer(function AccountsScreen() {
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
