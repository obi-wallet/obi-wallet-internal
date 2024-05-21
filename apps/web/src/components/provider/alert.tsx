import { Alert, AlertContext } from "@/contexts/alert";
import { ReactNode, useCallback, useEffect, useState } from "react";

import { AlertType } from "../custom-alert";

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertQueue, setAlertQueue] = useState<Alert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);

  const showAlert = useCallback((message: string, type?: AlertType) => {
    setAlertQueue((prevQueue) => {
      return [...prevQueue, { message, type }];
    });
  }, []);

  const closeAlert = useCallback(() => {
    setCurrentAlert(null);
  }, []);

  useEffect(() => {
    if (!currentAlert && alertQueue.length > 0) {
      const [nextAlert] = alertQueue;
      if (nextAlert === undefined) return; //typescript complains about it being undefined even if I check for it above
      setCurrentAlert(nextAlert);
      setAlertQueue((prevQueue) => {
        return prevQueue.slice(1);
      });
    }
  }, [alertQueue, currentAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert, currentAlert }}>
      {children}
    </AlertContext.Provider>
  );
}
