import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Back } from "./back";
import { Background } from "./background";
import { KeyboardAvoidingView } from "./keyboard-avoiding-view";

export function OnboardingScreenContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
      >
        <Background />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "space-between",
          }}
        >
          <Back
            style={{
              marginLeft: -5,
              padding: 5,
              width: 25,
            }}
          />
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
