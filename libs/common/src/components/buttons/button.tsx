import { Theme, useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
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
  },
});

const getFlavorStyles = (
  flavor: "primary" | "cancel",
  theme: Theme,
  disabled: boolean,
) => {
  return {
    ...baseStyles,
    text: {
      ...baseStyles.text,
      ...theme.textStyles.light,
      // TODO: recheck
      ...{ color: theme.colors?.text },
      ...(disabled ? theme.defaultDisabledButtonStyle?.text : {}),
    },
    button: {
      ...baseStyles.button,
      // TODO: recheck
      ...theme.buttonFlavors?.[flavor],
      opacity: disabled ? 0.5 : 1,
      ...(disabled ? theme.defaultDisabledButtonStyle : {}),
    },
  };
};

export interface ButtonProps
  extends Omit<
    TouchableWithoutFeedbackProps,
    "children" | "hitSlop" | "style"
  > {
  flavor: "primary" | "cancel";
  label: string;
  disabled?: boolean;
  LeftIcon?: FC<SvgProps>;
  RightIcon?: FC<SvgProps>;
  buttonStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Button = observer(function Button({
  flavor,
  label,
  disabled = false,
  LeftIcon,
  RightIcon,
  buttonStyle,
  labelStyle,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const flavorStyles = getFlavorStyles(flavor, theme, disabled);
  const children = (
    <View>
      {LeftIcon ? (
        <LeftIcon width={24} height={24} style={baseStyles.leftIcon} />
      ) : null}
      <Text style={[flavorStyles.text, labelStyle]}>{label}</Text>
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
