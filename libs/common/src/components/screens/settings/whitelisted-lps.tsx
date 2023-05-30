import { useTheme } from "@emotion/react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { View } from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAsyncEffect } from "rooks";

import { useStore } from "../../../contexts";
import { isSmallScreenNumber } from "../../../helpers";
import { RootStackParamList, SettingsRoute } from "../../../router";
import { Back } from "../../back";
import { Text } from "../../typography";

export type WhitelistedLpsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  SettingsRoute.WhitelistedLPs
>;

export const WhitelistedLpsScreen = observer<WhitelistedLpsScreenProps>(
  function WhitelistedLPsScreen({ navigation }) {
    const [spendLimit, setSpendLimit] = useState<string>("0");
    const isObi = useStore().configStore.isObi();
    const [loading, setLoading] = useState<boolean>(true);
    const theme = useTheme();
    const [lpList, setLpList] = useState<any[]>([]);

    useAsyncEffect(async () => {
      // const lpList = await setLpList(lpList);
      setLoading(false);
    }, []);

    return (
      <SafeAreaView
        style={{ backgroundColor: theme.colors.background, flex: 1 }}
      >
        <View
          style={{
            marginTop: isObi ? 10 : isSmallScreenNumber(10, 25),
            paddingTop: isSmallScreenNumber(0, 32),
            paddingBottom: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ marginRight: -60, marginLeft: 10, zIndex: 2 }}>
            <Back />
          </View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: isSmallScreenNumber(20, 24),
                fontWeight: "600",
              }}
            >
              Whitelisted LPs
            </Text>
          </View>
        </View>
        <View style={{ flex: 1 }}></View>
      </SafeAreaView>
    );
  }
);
