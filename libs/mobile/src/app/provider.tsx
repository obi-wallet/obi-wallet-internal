import {
  Provider as OriginalProvider,
  ProviderProps as OriginalProviderProps,
} from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import {
  PHONE_NUMBER_KEY_SECRET,
  PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD,
  PHONE_NUMBER_TWILIO_BASIC_AUTH_USER,
} from "react-native-dotenv";

export type ProviderProps = Omit<OriginalProviderProps, "env">;

export const Provider = observer<ProviderProps>(function Provider(props) {
  const env = {
    PHONE_NUMBER_KEY_SECRET,
    PHONE_NUMBER_TWILIO_BASIC_AUTH_USER,
    PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD,
  };

  return <OriginalProvider {...props} env={env} />;
});
