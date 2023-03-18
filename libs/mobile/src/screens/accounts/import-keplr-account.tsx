import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { LegacyForm } from "./legacy-form";

export type ImportKeplrAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.ImportKeplrAccount
>;

export const ImportKeplrAccountScreen = observer<ImportKeplrAccountScreenProps>(
  function ImportKeplrAccountScreen(props) {
    return <LegacyForm {...props} coinType={118} />;
  }
);
