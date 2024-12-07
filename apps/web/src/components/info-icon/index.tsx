"use client";

import { useStore } from "@/contexts/store";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { FaQuestionCircle } from "react-icons/fa";

export const InfoIcon = observer(function InfoIcon({
  topicId,
  variant = "default",
  className,
  onClick,
  marginLeft = "2",
}: {
  topicId: string;
  variant?: "default" | "onPrimary";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  marginLeft?: string;
}) {
  const { educationStore } = useStore();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        educationStore.setTopicById(topicId, "info-icon");
        onClick?.(e);
      }}
      className={cn(
        "info-icon flex items-center justify-center",
        `ml-${marginLeft}`,
        variant === "default" && "text-gray-400 hover:text-white",
        variant === "onPrimary" && "text-[#070707]",
        className,
      )}
    >
      <FaQuestionCircle className="h-4 w-4" />
    </button>
  );
});
