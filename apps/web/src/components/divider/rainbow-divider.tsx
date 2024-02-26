import { cn } from "@/lib/utils";

export function RainbowDivider({
  text = "",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-rainbow h-1 w-full",
        text !== "" && "before:me-6 after:ms-6 ",
        className,
      )}
    >
      {text}
    </div>
  );
}
