import { KeyType } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import React from "react";
import { View } from "react-native";

import { HomeBottomTabRoute, useRootNavigation } from "../../../router";
import { Button } from "../../buttons";
import { KeysList } from "../../multisig-settings";
import { OsmosisScreenContainer } from "../../osmosis-screen-container";
import { Text } from "../../typography";

export const LoginScreen = observer(function LoginScreen() {
  const navigation = useRootNavigation();
  return (
    <OsmosisScreenContainer
      onBack={() => {
        navigation.navigate(HomeBottomTabRoute.Assets);
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "white", fontWeight: "700", marginBottom: 20 }}>
            Welcome Back
          </Text>
          <Text style={{ color: "white", opacity: 0.6 }}>
            Sign Once and Play (Keys Required 1/2)
          </Text>
          <KeysList
            data={[
              {
                type: KeyType.Device,
                signed: false,
                right: null,
              },
              {
                type: KeyType.Phone,
                signed: false,
                right: null,
              },
            ]}
            tiled
            animate={true}
            style={{
              marginVertical: 10,
              backgroundColor: "transparent",
              borderRadius: 12,
              alignItems: "center",
            }}
          />
        </View>

        <Button
          flavor="primary"
          onPress={() => {
            navigation.navigate(HomeBottomTabRoute.Assets);
          }}
          label="Skip & Sign For Each Transaction"
          buttonStyle={{ marginBottom: 100 }}
        />
      </View>
    </OsmosisScreenContainer>
  );
});
