import { observer } from "mobx-react-lite";

import { AccountsOverviewScreen } from "./accounts-overview";
import { AccountsRoute, AccountsStack } from "./accounts-stack";
import { AddAccountScreen } from "./add-account";

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
        name={AccountsRoute.Overview}
        component={AccountsOverviewScreen}
      />
      <AccountsStack.Screen
        name={AccountsRoute.AddAccount}
        component={AddAccountScreen}
      />
    </AccountsStack.Navigator>
  );
});
