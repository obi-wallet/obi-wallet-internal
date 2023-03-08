import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { TextProps, TextStyle, ViewStyle } from "react-native";
import { Animated, Easing } from "react-native";

export const AnimatedText = observer(function AnimatedText({
  text,
  style,
  textStyle,
  ...rest
}: { text: string; style: ViewStyle; textStyle: TextStyle } & TextProps) {
  const [animatedText, setAnimatedText] = useState(text);
  const animation = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (animatedText === "" && text !== "") {
      setAnimatedText(text);
      return;
    }
    if (animatedText === text) return;
    Animated.timing(animation, {
      toValue: 0,
      duration: 100,
      easing: Easing.sin,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      setAnimatedText(text);
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        easing: Easing.sin,
        useNativeDriver: true,
      }).start();
    }, 201);
  }, [text]);

  return (
    <Animated.View style={[style, { opacity: animation }]}>
      <Text {...rest} style={[textStyle]}>
        {animatedText}
      </Text>
    </Animated.View>
  );
});
