import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KeyboardAvoidingView } from "../../../keyboard-avoiding-view";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";

export const EmailContainer = observer(function EmailContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OsmosisScreenContainer>
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 20,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>{children}</View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </OsmosisScreenContainer>
  );
});
