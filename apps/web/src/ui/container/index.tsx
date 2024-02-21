import { cn } from "@/lib/utils";

export function InputContainer({
  children,
  label,
  className,
  labelClassname = "",
  onClick,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
  labelClassname?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "hover:border-color relative   rounded-xl  border border-gray-700 p-6 hover:border-blue-600 ",
        "focus-within:border-blue-600",
        "flex items-center justify-between",
        className,
      )}
      onClick={onClick}
    >
      {children}
      {label && (
        <label
          className={`bg-background-secondary absolute left-0 top-0 ml-5 -translate-y-1/2  px-2 py-1 text-xs text-white ${labelClassname}`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
