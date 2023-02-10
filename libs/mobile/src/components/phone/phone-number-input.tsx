import { useTheme } from "@emotion/react";
import { Text, TextInput as OriginalTextInput } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ComponentType, useEffect, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
  ScrollView,
} from "react-native";
import CountryPicker, {
  CountryModalProvider,
} from "react-native-country-picker-modal";
import { DARK_THEME } from "react-native-country-picker-modal";
import { CountryCode, Country } from "react-native-country-picker-modal";
import { TouchableOpacity } from "react-native-gesture-handler";

import { isSmallScreenNumber } from "../../app/screens/components/screen-size";
import { useStore } from "../../app/stores";

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
    buttonview: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 14,
      fontWeight: 500,
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
    data: {
      backgroundColor: "white",
      padding: 10,
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
  const { languageStore, configStore } = useStore();
  const isObi = configStore.isObi();
  const { currentLanguage } = languageStore;

  // possible Languages to add
  // "common","cym","deu","fra","hrv","ita","jpn","nld","por","rus","spa","svk","fin","zho","isr";

  const dropdownLanguage = (langCode: string) => {
    if (langCode === "de") {
      return "deu";
    } else if (langCode === "es") {
      return "spa";
    } else {
      return "common"; // English
    }
  };

  const [visible, setVisible] = useState(false);
  const switchVisible = () => setVisible(!visible);
  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
  };
  const theme = useTheme();
  const styles = getStyles(isObi);
  // Default Selection
  const [countryCode, setCountryCode] = useState<CountryCode>("US");
  const [country, setCountry] = useState<Country>({
    callingCode: ["1"],
    cca2: "US",
    currency: ["USD"],
    flag: "flag-us",
    name: "United States",
    region: "Americas",
    subregion: "North America",
  });
  const withCountryNameButton = false;
  const withCurrencyButton = false;
  const withFlagButton = true;
  const withCallingCodeButton = true;
  const withFlag = true;
  const withEmoji = false;
  const withFilter = true;
  const withAlphaFilter = false;
  const withCallingCode = true;
  const withCurrency = false;
  const withModal = true;
  const dark = false;
  const fontScaling = true;
  const disableNativeModal = false;
  const preferredCountries = undefined; // ["US"]

  useEffect(() => {
    handlePhoneNumberCountryCode("+" + country.callingCode); // Pass country.callingcode back to parent component "onboarding2"
  }, [country.callingCode, handlePhoneNumberCountryCode]);

  return (
    <View style={style}>
      <CountryModalProvider>
        <ScrollView>
          {label ? <Text style={styles.label}>{label}</Text> : null}

          <View style={styles.wholeview}>
            <TouchableOpacity style={styles.buttonview} onPress={switchVisible}>
              <CountryPicker
                theme={
                  dark
                    ? DARK_THEME
                    : {
                        primaryColorVariant: "#090816",
                        backgroundColor: theme.colors.background,
                        onBackgroundTextColor: "#F6F5FF",
                        fontSize: isSmallScreenNumber(14, 16),
                        filterPlaceholderTextColor: "#4B4E6E",
                        activeOpacity: 0.7,
                      }
                }
                {...{
                  allowFontScaling: fontScaling,
                  countryCode,
                  withFilter,
                  excludeCountries: ["AQ", "BV", "TF", "HM", "UM"], // No Calling-Code available
                  withFlag,
                  withCurrencyButton,
                  withCallingCodeButton,
                  withCountryNameButton,
                  withAlphaFilter,
                  withCallingCode,
                  withCurrency,
                  withEmoji,
                  withModal,
                  withFlagButton,
                  onSelect,
                  disableNativeModal,
                  preferredCountries,
                  modalProps: {
                    visible,
                  },
                  onClose: () => setVisible(false),
                  onOpen: () => setVisible(true),
                  translation: dropdownLanguage(currentLanguage),
                }}
              />
            </TouchableOpacity>

            <View style={styles.inputview}>
              <CustomTextInput
                style={[styles.input, inputStyle]}
                placeholderTextColor={
                  isObi ? "rgba(255,255,255,0.6)" : "#4B4E6E"
                }
                {...props}
              />
            </View>
          </View>
        </ScrollView>
      </CountryModalProvider>
    </View>
  );
});
