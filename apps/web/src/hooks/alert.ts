import { AlertContext, AlertContextType } from "@/contexts/alert";
import { useContext } from "react";

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
