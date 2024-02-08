import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
// @ts-expect-error types for Picker missing
import { Picker, View } from "react-native";
import { DropDownPickerProps } from "react-native-dropdown-picker";

export const DropDownPicker = observer<DropDownPickerProps<unknown | null>>(
  function DropDownPicker(props) {
    const theme = useTheme();

    return (
      <View
        style={{
          borderRadius: 30,
          borderColor: "#fff",
          paddingRight: 20,
          borderWidth: 1,
          ...theme.dropdown?.containerStyle,
        }}
      >
        <Picker
          enabled={!props.disabled}
          onValueChange={(item: string) => {
            props.setValue(() => {
              return item;
            });
          }}
          selectedValue={props.value}
          style={{
            backgroundColor: "transparent",
            borderWidth: 0,
            color: "#fff",
            // paddingHorizontal: 20,
            height: 56,
            fontSize: 14,
            ...theme.textStyles.regular,
          }}
        >
          {props.items.map((item) => {
            return (
              <Picker.Item
                key={item.value as string}
                label={item.label}
                value={item.value}
              />
            );
          })}
        </Picker>
      </View>
    );
  },
);
