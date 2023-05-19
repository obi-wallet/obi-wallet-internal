import {
  Provider as OriginalProvider,
  ProviderProps as OriginalProviderProps,
} from "@obi-wallet/common";
import { observer } from "mobx-react-lite";

export type ProviderProps = Omit<OriginalProviderProps, "env">;

export const Provider = observer<ProviderProps>(function Provider(props) {
  const env = {};

  return <OriginalProvider {...props} env={env} />;
});
