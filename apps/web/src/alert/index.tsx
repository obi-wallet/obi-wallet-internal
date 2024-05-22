import { useStore } from "@/contexts";
import { observer } from "mobx-react-lite";

import { CustomAlert } from "./custom-alert";

export const Alert = observer(function Alert() {
  const { alertStore } = useStore();

  if (!alertStore.currentAlert) return null;

  return (
    <CustomAlert
      alert={alertStore.currentAlert}
      onClose={alertStore.closeAlert}
    />
  );
});
