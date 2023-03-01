import { useTheme } from "@emotion/react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import { Back } from "./back";
import { Background } from "./background";
import { KeyboardAvoidingView } from "./keyboard-avoiding-view";

export function OnboardingScreenContainer({
  children,
  back = true,
}: {
  children: React.ReactNode;
  back?: boolean;
}) {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
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
          {back && (
            <Back
              style={{
                marginLeft: -5,
                padding: 5,
                width: 25,
              }}
            />
          )}
          {children}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
