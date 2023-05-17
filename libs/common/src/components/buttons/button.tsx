import { Theme, useTheme } from "@emotion/react";
import { Brand } from "@obi-wallet/config";
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

import { useStore } from "../../contexts";
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
      backgroundColor: "#59D6E6",
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
    backgroundColor: "#949494cc",
    opacity: 0.5,
  },
});

const getFlavorStyles = (
  brand: Brand,
  flavor: keyof typeof loopFlavors | keyof typeof obiFlavors,
  theme: Theme,
  disabled: boolean
) => {
  switch (brand) {
    case Brand.Obi: {
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
          fontFamily: theme.fonts.light,
          fontWeight: "normal" as const,
          color: "#fff",
          ...flavorStyles.text,
        },
        button: {
          ...baseStyles.button,
          backgroundColor: "#437DFF",
          opacity: 1,
          ...flavorStyles.button,
        },
      };
    }
    case Brand.Loop: {
      const loopBorderRadius = 12;
      if (disabled)
        return {
          ...baseStyles,
          fontWeight: baseStyles.text.fontWeight,
          button: {
            ...baseStyles.button,
            borderRadius: loopBorderRadius,
          },
        };

      const flavorStyles: Flavor = R.propOr(
        { text: {}, button: {} },
        flavor,
        loopFlavors
      );
      return {
        ...baseStyles,
        text: {
          ...baseStyles.text,
          ...flavorStyles.text,
          fontFamily: theme.fonts.bold,
        },
        button: {
          ...baseStyles.button,
          ...flavorStyles.button,
          borderRadius: loopBorderRadius,
          opacity: 1,
        },
      };
    }
  }
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
  const { configStore } = useStore();
  const theme = useTheme();
  const brand = configStore.brand;
  const flavorStyles = getFlavorStyles(brand, flavor, theme, disabled);
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

  if (Platform.OS === "ios") {
    return <TouchableHighlight {...buttonProps} onPress={onPress} />;
  } else {
    return (
      <TouchableNativeFeedback {...buttonProps} onPress={onPress}>
        <View {...buttonProps} />
      </TouchableNativeFeedback>
    );
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
