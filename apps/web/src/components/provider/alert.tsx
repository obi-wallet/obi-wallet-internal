import { Alert, AlertContext } from "@/contexts/alert";
import { ReactNode, useCallback, useState } from "react";

import { AlertType } from "../custom-alert";

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertQueue, setAlertQueue] = useState<Alert[]>([]);
  const currentAlert = alertQueue[0] ?? null;

  const showAlert = useCallback((message: string, type: AlertType) => {
    setAlertQueue((prevQueue) => {
      return [...prevQueue, { message, type }];
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertQueue((prevQueue) => {
      return prevQueue?.slice(1);
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert, currentAlert }}>
      {children}
    </AlertContext.Provider>
  );
}
