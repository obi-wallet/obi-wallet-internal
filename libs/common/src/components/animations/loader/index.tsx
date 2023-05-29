import Lottie from "lottie-react";
import type { AnimationObject } from "lottie-react-native";
import { observer } from "mobx-react-lite";
import { CSSProperties } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

import { Text } from "../../typography";
import ellipsesAnimation from "../assets/ellipses.json";

export interface LoaderProps {
  loadingText?: string;
  style?: StyleProp<ViewStyle>;
  animation: string | AnimationObject;
  animationStyles?: ViewStyle & CSSProperties;
}

export const Loader = observer(function Loader({
  loadingText,
  style,
  animation,
  animationStyles,
}: LoaderProps) {
  return (
    <View style={style}>
      <Lottie
        animationData={animation}
        autoPlay
        loop
        style={{
          maxHeight: 60,
          maxWidth: 60,
          width: "100%",
          ...animationStyles,
        }}
      />
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
          <View style={{ height: 11, width: 20, justifyContent: "center" }}>
            <Lottie animationData={ellipsesAnimation} autoPlay loop />
          </View>
        </View>
      ) : null}
    </View>
  );
});
