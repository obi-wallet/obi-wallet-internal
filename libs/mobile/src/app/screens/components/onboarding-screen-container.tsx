import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Back } from "./back";
import { Background } from "./background";
import { KeyboardAvoidingView } from "./keyboard-avoiding-view";
import { useStore } from "../../stores";

export const OnboardingScreenContainer = observer(
  function OnboardingScreenContainer({ children }: { children: ReactNode }) {
    const { configStore } = useStore();
    const isObi = configStore.isObi();

    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isObi ? "#1A1A1A" : "" }}
      >
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
);
