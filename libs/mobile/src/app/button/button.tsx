import { Theme, useTheme } from "@emotion/react";
import { Brand, Text } from "@obi-wallet/common";
import { FC } from "react";
import {
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedbackProps,
  View,
} from "react-native";
import { SvgProps } from "react-native-svg";
import { isSmallScreenNumber } from "../screens/components/screen-size";

import { useStore } from "../stores";

const loopFlavors = {
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
const baseStyles = StyleSheet.create({
  leftIcon: {
    marginRight: 8,
  },
  text: {
    fontWeight: "600",
    fontSize: isSmallScreenNumber(13, 16),
    color: "#00000082",
  },
  button: {
    marginVertical: isSmallScreenNumber(3, 5),
    width: "100%",
    height: isSmallScreenNumber(35, 56),
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
  flavor: keyof typeof loopFlavors,
  theme: Theme,
  disabled: boolean
) => {
  switch (brand) {
    case Brand.Obi: {
      if (disabled) return baseStyles;

      return {
        ...baseStyles,
        text: {
          ...baseStyles.text,
          fontFamily: theme.fonts.light,
          fontWeight: "normal",
          color: "#fff",
        },
        button: {
          ...baseStyles.button,
          backgroundColor: "#437DFF",
          opacity: 1,
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

      const flavorStyles = loopFlavors[flavor];
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
  extends Omit<TouchableWithoutFeedbackProps, "children"> {
  flavor: keyof typeof loopFlavors;
  label: string;
  disabled?: boolean;
  LeftIcon?: FC<SvgProps>;
  RightIcon?: FC<SvgProps>;
}

export function Button({
  flavor,
  label,
  disabled = false,
  LeftIcon,
  RightIcon,
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
    style: flavorStyles.button,
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
}
