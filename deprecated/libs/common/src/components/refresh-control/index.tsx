import { observer } from "mobx-react-lite";
import {
  RefreshControl as OriginalRefreshControl,
  RefreshControlProps,
} from "react-native";

export const RefreshControl = observer(function RefreshControl(
  props: RefreshControlProps,
) {
  return (
    <OriginalRefreshControl {...props} tintColor="rgba(246, 245, 255, 0.6)" />
  );
});
