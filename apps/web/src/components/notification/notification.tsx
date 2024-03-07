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
        " min-h-[40px] w-full items-center space-x-2 bg-blue-600 px-11 pb-3 pt-3 shadow-md max-md:p-2 md:flex",
        // "max-sm:hidden",
        type === "warning" && "bg-[#ffa70b]",
        type === "success" && "bg-[#34D399]",
        type === "error" && "bg-[#F87171]",
      )}
    >
      <div className="max-md:hidden">
        {type === "warning" && (
          <FaTriangleExclamation color="black" width={24} height={24} />
        )}
        {type === "success" && (
          <FaSquareCheck color="black" width={24} height={24} />
        )}
        {type === "error" && (
          <FaRectangleXmark color="black" width={24} height={24} />
        )}
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: description }}
        className="leading-relaxed text-black max-sm:text-xs md:text-sm md:font-medium"
      />
    </div>
  );
}
