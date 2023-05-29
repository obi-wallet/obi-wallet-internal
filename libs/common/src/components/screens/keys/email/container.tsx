import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Back } from "../../../back";
import { Background } from "../../../background";
import { KeyboardAvoidingView } from "../../../keyboard-avoiding-view";

export const EmailContainer = observer(function EmailContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Background />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Back
              style={{
                marginLeft: -5,
                padding: 5,
                width: 25,
              }}
            />
            {children}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
});
