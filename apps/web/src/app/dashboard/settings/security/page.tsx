"use client";
import { Box, Button, Divider, Text } from "@/components";
import { cn } from "@/lib/utils";
import { FaPlus, FaTriangleExclamation } from "react-icons/fa6";
interface KeyItem {
  mandatory?: boolean;
  label: string;
  active?: true;
  comingSoon?: true;
  count: number;
}

const KeyListItem = ({ keyData, ...rest }: { keyData: KeyItem }) => {
  return (
    <Button
      key={keyData.label}
      variant="secondary"
      disabled={keyData.comingSoon}
      block
      {...rest}
      className="relative border-none"
    >
      {!keyData.active ? "Add " : ""}
      {keyData.label}
      <div
        className={cn(
          "absolute right-0 flex h-full w-14 items-center justify-center rounded-r",
          keyData.count > 0
            ? "bg-emerald-500"
            : keyData.mandatory
              ? "bg-red-500"
              : "bg-slate-500",
        )}
      >
        {keyData.count > 0 ? (
          keyData.count
        ) : keyData.mandatory ? (
          <FaTriangleExclamation className="h-4 w-4" color="white" />
        ) : (
          <FaPlus className="h-4 w-4" color="white" />
        )}
      </div>
    </Button>
  );
};

export default function Settings() {
  const keyList: KeyItem[] = [
    {
      label: "Passkey",
      active: true,
      count: 0,
      mandatory: true,
    },
    {
      label: "Phone Key",
      active: true,
      count: 2,
    },
    {
      label: "Telegram Key",
      active: true,
      count: 1,
    },
    {
      label: "Ledger Key",
      active: true,
      count: 0,
    },
  ];

  const mandatoryKey = keyList.find((item) => item.mandatory);

  return (
    <Box className="h-fit w-1/2 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Security Settings
      </Text>
      <Text size="sm" fontWeight="light" className="mt-3">
        Add keys to your account. Click any of the options below to update or
        add keys to your account.
      </Text>
      <Box className="bg-background-select mt-3 flex flex-col justify-between gap-2">
        <Text size="sm" fontWeight="medium" color="white">
          My Accounts
        </Text>
        <div className="flex flex-row justify-between">
          <Text size="sm" fontWeight="light" color="zinc">
            Keys Required To Sign
          </Text>
          <Text size="sm" fontWeight="semibold" color="white">
            {`1 of ${keyList.length}`}
          </Text>
        </div>
      </Box>
      <Divider className="my-2" />

      <div className="space-y-2">
        {mandatoryKey && (
          <Box className="mt-4 bg-red-500">
            {`Please add a ${mandatoryKey.label.toLocaleLowerCase()} on this device to continue using your Obi account.`}
          </Box>
        )}
        {keyList.map((sigKey) => (
          <KeyListItem keyData={sigKey} />
        ))}
      </div>
      <div className="mt-40 grid grid-cols-2 gap-8">
        <Button variant="secondary" block href="/dashboard/settings">
          Back
        </Button>
        <Button variant="primary" block>
          Save
        </Button>
      </div>
    </Box>
  );
}
