import { AlertType } from "@/alert/type";
import { DangerAnimation } from "@/animations/danger";
import { SuccessAnimation } from "@/animations/success";
import { WarningAnimation } from "@/animations/warning";
import { cn } from "@/lib/utils";
import { Alert } from "@/stores";
import { observer } from "mobx-react-lite";

const animations = {
  [AlertType.Error]: DangerAnimation,
  [AlertType.Success]: SuccessAnimation,
  [AlertType.Warning]: WarningAnimation,
};

export interface CustomAlertProps {
  alert: Alert;
  onClose: () => void;
}

export const CustomAlert = observer<CustomAlertProps>(function CustomAlert({
  alert,
  onClose,
}) {
  const Animation = animations[alert.type];

  return (
    <div className="bg-background fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <div className="min-w-56 max-w-96 rounded-lg bg-gray-900 p-6 text-center shadow-lg">
        <div className={cn("m-0 ml-auto mr-auto w-20")}>
          <Animation />
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
