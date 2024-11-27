import { Button } from "@/components";
import { cn } from "@/lib/utils";
import { SingleKeyMetaData } from "@/stores/key-meta-data";
import { KeySchema, KeyType } from "@obi-wallet/sdk";
import { FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import { z } from "zod";

export interface KeyItem {
  id: string;
  label: string;
  key: z.infer<typeof KeySchema>;
  keyMetaData: SingleKeyMetaData;
}

export interface KeyItems {
  type: KeyType;
  possiblePrimaryKey?: boolean;
  label: string;
  comingSoon?: true;
  keys: KeyItem[];
}

export function KeyListItem({
  keyData,
  onClick,
  alert,
  ...rest
}: {
  onClick: () => void;
  keyData: KeyItems;
  alert?: boolean | undefined;
}) {
  const keyCount = keyData.keys.length;
  const label =
    keyCount > 1
      ? `${keyData.label}${keyData.label.endsWith("s") ? "es" : "s"}`
      : keyData.label;
  return (
    <Button
      key={keyData.type}
      variant="secondary"
      textAlign="left"
      disabled={keyData.comingSoon}
      block
      {...rest}
      className="key-list-item relative border-none"
      onClick={onClick}
    >
      <span className="key-list-item-label">{label}</span>
      <div
        className={cn(
          "key-list-item-count absolute right-0 flex h-full w-14 items-center justify-center rounded-r",
          keyCount > 0 ? "bg-primary" : alert ? "bg-red-500" : "bg-slate-500",
        )}
      >
        {keyCount > 0 ? (
          <span className="key-list-item-number">{keyCount}</span>
        ) : alert ? (
          <FaTriangleExclamation
            className="key-list-item-alert h-4 w-4"
            color="white"
          />
        ) : (
          <FaPlus className="key-list-item-plus h-4 w-4" color="white" />
        )}
      </div>
    </Button>
  );
}
