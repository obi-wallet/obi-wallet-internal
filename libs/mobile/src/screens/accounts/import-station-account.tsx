import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { LegacyForm } from "./legacy-form";

export type ImportStationAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.ImportStationAccount
>;

export const ImportStationAccountScreen =
  observer<ImportStationAccountScreenProps>(function ImportStationAccountScreen(
    props
  ) {
    return <LegacyForm {...props} />;
  });
