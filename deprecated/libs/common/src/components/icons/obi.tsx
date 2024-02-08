import { observer } from "mobx-react-lite";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";

export const ObiIcon = observer<{ style?: StyleProp<ViewStyle> }>(
  function ObiLogo({ style }) {
    return (
      <View
        style={[
          {
            backgroundColor: "#ffffff",
            borderRadius: 999,
          },
          style,
        ]}
      >
        <Icon />
      </View>
    );
  },
);

const Icon = observer<SvgProps>(function Icon(props) {
  return (
    <Svg viewBox="0 0 382 382" {...props}>
      <Path
        fill="#437dff"
        d="M105.76 167.65c-13.61 0-20.78 9.27-20.78 23.62s7.18 23.47 20.78 23.47 20.63-9.42 20.63-23.47-7.33-23.62-20.63-23.62ZM217.3 188.29c-6.88 0-12.26 4.93-12.26 14.2s5.38 14.21 12.26 14.21 12.26-4.93 12.26-14.21-5.38-14.2-12.26-14.2Z"
      />
      <Path
        fill="#437dff"
        d="M191 0C85.51 0 0 85.51 0 191s85.51 191 191 191 191-85.51 191-191S296.49 0 191 0Zm-85.24 245.7c-30.05 0-54.57-22.58-54.57-54.43s24.52-54.28 54.57-54.28 54.28 22.43 54.28 54.28-24.37 54.43-54.28 54.43Zm122.6 0c-11.21 0-19.14-4.93-23.18-12.56v11.51h-33.19V134h33.19v37.83c4.04-7.63 11.96-12.56 23.18-12.56 19.44 0 34.84 16 34.84 43.21s-15.4 43.21-34.84 43.21Zm78.5-1.05h-33.19v-84.33h33.19v84.33Zm-16.45-91.06c-11.81 0-19.14-7.18-19.14-16.3s7.33-16.6 19.14-16.6 18.99 7.33 18.99 16.6-7.33 16.3-18.99 16.3Z"
      />
    </Svg>
  );
});
