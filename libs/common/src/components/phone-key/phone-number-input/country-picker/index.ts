import { observer } from "mobx-react-lite";
import type { Country, CountryCode } from "react-native-country-picker-modal";
import warning from "tiny-warning";

export const CountryPicker = observer<{
  value: { countryCode: CountryCode; country: Country };
  onChange: (value: { countryCode: CountryCode; country: Country }) => void;
}>(function CountryPicker() {
  warning(false, "CountryPicker is not implemented for web");
  return null;
});
