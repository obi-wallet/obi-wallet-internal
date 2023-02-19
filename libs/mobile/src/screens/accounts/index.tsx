import { observer } from "mobx-react-lite";

import { AccountsOverviewScreen } from "./accounts-overview";
import { AccountsRoute, AccountsStack } from "./accounts-stack";
import { AddAccountScreen } from "./add-account";
import { CreateFlexAccountScreen } from "./create-flex-account";

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
    </AccountsStack.Navigator>
  );
});
