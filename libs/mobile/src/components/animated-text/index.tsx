import { Text } from "@obi-wallet/common-deprecated";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  TextProps,
  TextStyle,
  ViewStyle,
} from "react-native";

export interface AnimatedTextProps extends Omit<TextProps, "style"> {
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AnimatedText = observer<AnimatedTextProps>(function AnimatedText({
  text,
  style,
  textStyle,
  ...rest
}) {
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
    }, 200);
  }, [animatedText, animation, text]);

  return (
    <Animated.View style={[style, { opacity: animation }]}>
      <Text {...rest} style={textStyle}>
        {animatedText}
      </Text>
    </Animated.View>
  );
});
