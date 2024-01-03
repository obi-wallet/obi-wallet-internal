import { cn } from "@/lib/utils";

export enum DividerDirection {
  Horizontal,
  Vertical,
}
export function Divider({
  direction = DividerDirection.Horizontal,
  text = "",
}: {
  direction?: DividerDirection;
  text?: string;
}) {
  switch (direction) {
    case DividerDirection.Horizontal:
      return (
        <div
          className={cn(
            "flex items-center text-xs uppercase text-gray-700 before:flex-[1_1_0%] before:border-t-2 before:border-gray-700 after:flex-[1_1_0%] after:border-t-2 after:border-gray-700",
            text !== "" && "before:me-6 after:ms-6 ",
          )}
        >
          {text}
        </div>
      );
    case DividerDirection.Vertical:
      return (
        <div className="flex w-full items-center justify-center">
          <div className="h-full min-h-[1em] w-0.5 self-stretch bg-neutral-100 opacity-100 dark:opacity-50"></div>
        </div>
      );
    default:
      return null;
  }
}
