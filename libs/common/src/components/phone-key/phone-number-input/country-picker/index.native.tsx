import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import OriginalCountryPicker, {
  Country,
  CountryCode,
  CountryModalProvider,
  DARK_THEME,
} from "react-native-country-picker-modal";

import { useStore } from "../../../../contexts";
import { isSmallScreenNumber } from "../../../../helpers";

const getStyles = (isObi: boolean) =>
  StyleSheet.create({
    buttonview: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 14,
      fontWeight: 500,
    },
  });

export const CountryPicker = observer<{
  value: { countryCode: CountryCode; country: Country };
  onChange: (value: { countryCode: CountryCode; country: Country }) => void;
}>(function CountryPicker({ value, onChange }) {
  const { languageStore, configStore } = useStore();
  const { currentLanguage } = languageStore;
  const isObi = configStore.isObi();
  const theme = useTheme();
  const styles = getStyles(isObi);

  const [visible, setVisible] = useState(false);
  const switchVisible = () => setVisible(!visible);

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

  return (
    <CountryModalProvider>
      <TouchableOpacity style={styles.buttonview} onPress={switchVisible}>
        <OriginalCountryPicker
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
            countryCode: value.countryCode,
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
            onSelect(country) {
              onChange({
                countryCode: country.cca2,
                country,
              });
            },
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
    </CountryModalProvider>
  );
});
