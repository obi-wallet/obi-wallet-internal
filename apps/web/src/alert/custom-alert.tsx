import { cn } from "@/lib/utils";
import { Alert } from "@/stores";
import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";

import error from "./danger.json";
import success from "./success.json";
import warning from "./warning.json";

export enum AlertType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
}

export interface CustomAlertProps {
  alert: Alert;
  onClose: () => void;
}

export const CustomAlert = observer<CustomAlertProps>(function CustomAlert({
  alert,
  onClose,
}) {
  const getIcon = () => {
    switch (alert.type) {
      case AlertType.SUCCESS:
        return success;
      case AlertType.ERROR:
        return error;
      case AlertType.WARNING:
        return warning;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="min-w-56 max-w-96 rounded-lg bg-gray-900 p-6 text-center shadow-lg">
        <div className={cn("m-0 ml-auto mr-auto w-20 ")}>
          <Lottie animationData={getIcon()} loop={false} />
        </div>
        <p className="mb-4 p-5 text-white">{alert.message}</p>
        <button
          onClick={onClose}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
});
