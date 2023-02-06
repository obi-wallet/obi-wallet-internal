import LottieView from "lottie-react-native";
import SwitchAnimation from "./toggle-animation.json";
import { TouchableOpacity, ViewStyle } from "react-native";
import { useEffect, useRef, useState } from "react";
import { onChange } from "react-native-reanimated";

export const ToggleSwitch = ({
  active,
  styles,
  onChange,
}: {
  active: boolean;
  styles?: ViewStyle;
  onChange?: (active: boolean) => void;
}) => {
  const animationRef = useRef<LottieView>(null);
  const [isOn, setIsOn] = useState(active);
  useEffect(() => {
    if (isOn !== active) {
      setIsOn(active);
      toggleAnimation();
    }
  }, [active]);

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
};
