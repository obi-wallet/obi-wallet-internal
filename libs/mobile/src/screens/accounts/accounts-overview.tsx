import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute } from "./accounts-stack";
import { Button } from "../../app/button";
import { useRootNavigation } from "../../app/root-stack";

export const AccountsOverviewScreen = observer(
  function AccountsOverviewScreen() {
    const navigation = useRootNavigation();

    return (
      <View style={{ marginTop: 100 }}>
        <Button
          flavor="blue"
          label="Add"
          onPress={() => {
            navigation.navigate(AccountsRoute.AddAccount);
          }}
        />
      </View>
    );
  }
);
