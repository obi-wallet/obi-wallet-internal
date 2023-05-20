import { observer } from "mobx-react-lite";
import { ComponentType, useEffect, useState } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import type { Country, CountryCode } from "react-native-country-picker-modal";

import { CountryPicker } from "./country-picker";
import { useStore } from "../../../contexts";
import { isSmallScreenNumber } from "../../../helpers";
import { BaseTextInput as OriginalTextInput, Text } from "../../typography";

const getStyles = (isObi: boolean) =>
  StyleSheet.create({
    label: {
      color: isObi ? "white" : "#787B9C",
      fontSize: 10,
      marginBottom: 5,
      textTransform: "uppercase",
    },
    wholeview: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      height: isSmallScreenNumber(46, 56),
      borderWidth: 1,
      borderColor: isObi ? "white" : "#2F2B4C",
      borderRadius: 12,
    },
    inputview: {
      flex: 1,
      flexDirection: "row",
      height: isSmallScreenNumber(46, 56),
      borderColor: isObi ? "white" : "#2F2B4C",
      borderLeftWidth: 1,
    },
    input: {
      flex: 1,
      paddingLeft: 20,
      fontSize: isSmallScreenNumber(10, 14),
      fontWeight: "500",
      color: "#fff",
    },
  });

export const PhoneNumberInput = observer(function PhoneNumberInput({
  label,
  style,
  inputStyle,
  CustomTextInput = OriginalTextInput,
  handlePhoneNumberCountryCode,
  ...props
}: TextInputProps & {
  CustomTextInput?: ComponentType<TextInputProps>;
  label?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  handlePhoneNumberCountryCode: (param: string) => void;
}) {
  const { configStore } = useStore();
  const isObi = configStore.isObi();

  const styles = getStyles(isObi);

  const [value, setValue] = useState<{
    countryCode: CountryCode;
    country: Country;
  }>({
    countryCode: "US",
    country: {
      callingCode: ["1"],
      cca2: "US",
      currency: ["USD"],
      flag: "flag-us",
      name: "United States",
      region: "Americas",
      subregion: "North America",
    },
  });

  useEffect(() => {
    handlePhoneNumberCountryCode("+" + value.country.callingCode); // Pass country.callingcode back to parent component "onboarding2"
  }, [value, handlePhoneNumberCountryCode]);

  return (
    <View style={style}>
      <ScrollView>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View style={styles.wholeview}>
          <CountryPicker value={value} onChange={setValue} />

          <View style={styles.inputview}>
            <CustomTextInput
              style={[styles.input, inputStyle]}
              placeholderTextColor={isObi ? "rgba(255,255,255,0.6)" : "#4B4E6E"}
              {...props}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
});
