import LottieView, { AnimationObject } from "lottie-react-native";
import { observer } from "mobx-react-lite";
import { StyleProp, View, ViewStyle } from "react-native";

import { Text } from "../../typography";

export interface LoaderProps {
  loadingText?: string;
  style?: StyleProp<ViewStyle>;
  animation?: string | AnimationObject;
  animationStyles?: StyleProp<ViewStyle>;
}

export const Loader = observer(function Loader({
  loadingText,
  style,
  animation,
  animationStyles,
}: LoaderProps) {
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

    return (
      <LottieView
        source={require("../assets/obi-spinner.json")}
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
            <LottieView
              source={require("../assets/ellipses.json")}
              autoPlay
              loop
            />
          </View>
        </View>
      ) : null}
    </View>
  );
});
