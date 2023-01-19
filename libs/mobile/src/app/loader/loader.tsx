import { Text } from "@obi-wallet/common";
import LottieView, { AnimationObject } from "lottie-react-native";
import { observer } from "mobx-react-lite";
import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native";

import { useStore } from "../stores";

interface LoaderProps {
  loadingText?: string;
  style?: StyleProp<ViewStyle>;
  animation?: string | AnimationObject;
  animationStyles?: StyleProp<ViewStyle>;
}

export const Loader = observer(
  ({ loadingText, style, animation, animationStyles }: LoaderProps) => {
    const { configStore } = useStore();
    const isLoop = configStore.isLoop();
    const getAnimation = () => {
      if (animation) {
        return (
          <LottieView
            source={animation}
            autoPlay
            loop
            style={[
              { maxHeight: 60, maxWidth: 60, width: "100%" },
              animationStyles,
            ]}
          />
        );
      }
      if (isLoop) return <ActivityIndicator size="large" color="#8877EA" />;
      return (
        <LottieView
          source={require("./obi-spinner.json")}
          autoPlay
          loop
          style={{ maxHeight: 60, maxWidth: 60, width: "100%" }}
        />
      );
    };
    return (
      <View style={[style]}>
        {getAnimation()}
        {loadingText ? (
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text
              style={{
                color: "#F6F5FF",
                paddingTop: 15,
                fontSize: 11,
                letterSpacing: 0.25,
              }}
            >
              {loadingText}
            </Text>
            <View style={{ height: 11, width: 20 }}>
              <LottieView source={require("./ellipses.json")} autoPlay loop />
            </View>
          </View>
        ) : null}
      </View>
    );
  }
);
