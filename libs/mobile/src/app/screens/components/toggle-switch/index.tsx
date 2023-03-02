import LottieView from "lottie-react-native";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity, ViewStyle } from "react-native";
import { onChange } from "react-native-reanimated";

import SwitchAnimation from "./toggle-animation.json";

export const ToggleSwitch = observer(function ToggleSwitch({
  active,
  styles,
  onChange,
}: {
  active: boolean;
  styles?: ViewStyle;
  onChange?: (active: boolean) => void;
}) {
  const animationRef = useRef<LottieView>(null);
  const [isOn, setIsOn] = useState(active);
  useEffect(() => {
    if (isOn !== active) {
      setIsOn(active);
      toggleAnimation();
    }
  }, [active]);

  useEffect(() => {
    if (active) {
      animationRef.current?.play(70, 70);
    }
  }, []);

  const toggleAnimation = () => {
    if (isOn) {
      animationRef.current?.play(115, 240);
    } else {
      animationRef.current?.play(0, 70);
    }
  };
  const toggleIsOn = () => {
    setIsOn((prev) => {
      const state = !prev;

      toggleAnimation();
      onChange && onChange(state);
      return state;
    });
  };
  return (
    <TouchableOpacity onPress={toggleIsOn}>
      <LottieView
        ref={animationRef}
        source={SwitchAnimation}
        loop={false}
        style={[
          {
            width: "100%",
            height: "100%",
            transform: [{ scale: 2 }],
            marginLeft: 1,
          },
          {
            ...styles,
          },
        ]}
      />
    </TouchableOpacity>
  );
});
