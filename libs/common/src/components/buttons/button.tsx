import { Theme, useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { FC, useCallback, useState } from "react";
import {
  GestureResponderEvent,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedbackProps,
  View,
  ViewStyle,
} from "react-native";
import type { SvgProps } from "react-native-svg";
import { useEffectOnceWhen } from "rooks";

import { isSmallScreenNumber } from "../../helpers";
import { Text } from "../typography";

type Flavor = {
  text: TextStyle;
  button: ViewStyle;
};

const loopFlavors: Record<string, Flavor> = {
  blue: {
    text: {
      color: "#040317",
    },
    button: {
      // backgroundColor: "linear-gradient(#e66465, #9198e5)",
    },
  },
  green: {
    text: {
      color: "#040317",
    },
    button: {
      backgroundColor: "#48C95F",
    },
  },
  purple: {
    text: {
      color: "#FFFFFF",
    },
    button: {
      backgroundColor: "#8877EA",
    },
  },
  gray: {
    text: {
      color: "#00000082",
    },
    button: {
      backgroundColor: "#949494cc",
    },
  },
};

const obiFlavors: Record<string, Flavor> = {
  cancel: {
    button: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "#ffffff",
    },
    text: {},
  },
};

const baseStyles = StyleSheet.create({
  leftIcon: {
    marginRight: 8,
  },
  text: {
    fontWeight: "600",
    fontSize: isSmallScreenNumber(12, 16),
    color: "#00000082",
  },
  button: {
    marginVertical: isSmallScreenNumber(3, 5),
    width: "100%",
    height: isSmallScreenNumber(46, 56),
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
  },
});

const getFlavorStyles = (
  flavor: keyof typeof loopFlavors | keyof typeof obiFlavors,
  theme: Theme,
  disabled: boolean
) => {
  if (disabled) return baseStyles;

  const flavorStyles: Flavor = R.propOr(
    { text: {}, button: {} },
    flavor,
    obiFlavors
  );

  return {
    ...baseStyles,
    text: {
      ...baseStyles.text,
      ...theme.textStyles.light,
      color: "#fff",
      ...flavorStyles.text,
    },
    button: {
      ...baseStyles.button,
      // backgroundColor: "#437DFF",
      background: "linear-gradient(to right, #df05cb, #2c07e3)",
      opacity: 1,
      ...flavorStyles.button,
    },
  };
};

export interface ButtonProps
  extends Omit<
    TouchableWithoutFeedbackProps,
    "children" | "hitSlop" | "style"
  > {
  flavor: keyof typeof loopFlavors | keyof typeof obiFlavors;
  label: string;
  disabled?: boolean;
  LeftIcon?: FC<SvgProps>;
  RightIcon?: FC<SvgProps>;
  buttonStyle?: StyleProp<ViewStyle>;
}

export const Button = observer(function Button({
  flavor,
  label,
  disabled = false,
  LeftIcon,
  RightIcon,
  buttonStyle,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const flavorStyles = getFlavorStyles(flavor, theme, disabled);
  const children = (
    <View style={flavorStyles.button}>
      {LeftIcon ? (
        <LeftIcon width={24} height={24} style={baseStyles.leftIcon} />
      ) : null}
      <Text style={flavorStyles.text}>{label}</Text>
      {RightIcon ? <RightIcon width={24} height={24} /> : null}
    </View>
  );

  const buttonProps = {
    ...props,
    children,
    style: [flavorStyles.button, buttonStyle],
  };

  const onPress = (e: GestureResponderEvent) => {
    if (!disabled && typeof props.onPress === "function") {
      props.onPress(e);
    }
  };

  if (Platform.OS === "android") {
    return (
      <TouchableNativeFeedback {...buttonProps} onPress={onPress}>
        <View {...buttonProps} />
      </TouchableNativeFeedback>
    );
  } else {
    return <TouchableHighlight {...buttonProps} onPress={onPress} />;
  }
});

export interface AsyncButtonProps extends ButtonProps {
  onPress: () => Promise<void>;
  autoPress?: boolean;
}

export const AsyncButton = observer(function AsyncButton({
  onPress,
  autoPress,
  disabled,
  ...props
}: AsyncButtonProps) {
  const [pending, setPending] = useState(false);

  const onPressSingleton = useCallback(async () => {
    setPending(true);
    await onPress();
    setPending(false);
  }, [onPress]);

  useEffectOnceWhen(() => {
    if (autoPress) {
      void onPressSingleton();
    }
  });

  return (
    <Button
      {...props}
      onPress={onPressSingleton}
      disabled={pending || disabled}
    />
  );
});
