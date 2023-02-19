import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { Button } from "../../app/button";

export type CreateFlexAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.CreateFlexAccount
>;

export const CreateFlexAccountScreen = observer<CreateFlexAccountScreenProps>(
  function CreateFlexAccountScreen({ navigation }) {
    return (
      <View style={{ marginTop: 100 }}>
        <Button
          flavor="blue"
          label="Create Flex Account"
          onPress={() => {
            navigation.navigate(AccountsRoute.AccountsOverview);
          }}
        />
      </View>
    );
  }
);
