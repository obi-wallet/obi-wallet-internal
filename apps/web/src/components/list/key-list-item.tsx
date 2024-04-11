import { Button } from "@/components";
import { cn } from "@/lib/utils";
import { Key, KeyType } from "@obi-wallet/sdk";
import { FaPlus, FaTriangleExclamation } from "react-icons/fa6";

export interface KeyItem {
  id: string;
  label: string;
  key: Key;
}

export interface KeyItems {
  type: KeyType;
  mandatory?: boolean;
  label: string;
  comingSoon?: true;
  keys: KeyItem[];
}

export function KeyListItem({
  keyData,
  onClick,
  ...rest
}: {
  onClick: () => void;
  keyData: KeyItems;
}) {
  const keyCount = keyData.keys.length;
  return (
    <Button
      key={keyData.type}
      variant="secondary"
      disabled={keyData.comingSoon}
      block
      {...rest}
      className="relative border-none"
      onClick={onClick}
    >
      {keyData.label}
      <div
        className={cn(
          "absolute right-0 flex h-full w-14 items-center justify-center rounded-r",
          keyCount > 0
            ? "bg-emerald-500"
            : keyData.mandatory
              ? "bg-red-500"
              : "bg-slate-500",
        )}
      >
        {keyCount > 0 ? (
          keyCount
        ) : keyData.mandatory ? (
          <FaTriangleExclamation className="h-4 w-4" color="white" />
        ) : (
          <FaPlus className="h-4 w-4" color="white" />
        )}
      </div>
    </Button>
  );
}
