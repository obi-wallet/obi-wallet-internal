import { AlertType } from "@/components/custom-alert";
import { createContext } from "react";

export interface Alert {
  message: string;
  type: AlertType;
}

export interface AlertContextType {
  showAlert: (message: string, type: AlertType) => void;
  closeAlert: () => void;
  currentAlert: Alert | null;
}

export const AlertContext = createContext<AlertContextType | null>(null);
