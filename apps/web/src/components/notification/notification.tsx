import { cn } from "@/lib/utils";
import {
  FaTriangleExclamation,
  FaSquareCheck,
  FaRectangleXmark,
} from "react-icons/fa6";
export type NOTIFICATION_TYPE = "warning" | "success" | "error";

export function Notification({
  description,
  type,
}: {
  description: string;
  type: NOTIFICATION_TYPE;
}) {
  return (
    <div
      className={cn(
        " flex h-[72px] w-full items-center space-x-2 bg-blue-600 px-11 shadow-md",
        type === "warning" && "bg-[#ffa70b]",
        type === "success" && "bg-[#34D399]",
        type === "error" && "bg-[#F87171]",
      )}
    >
      {type === "warning" && (
        <FaTriangleExclamation color="black" width={24} height={24} />
      )}
      {type === "success" && (
        <FaSquareCheck color="black" width={24} height={24} />
      )}
      {type === "error" && (
        <FaRectangleXmark color="black" width={24} height={24} />
      )}

      <div
        dangerouslySetInnerHTML={{ __html: description }}
        className="font-medium leading-relaxed text-black"
      />
    </div>
  );
}
