"use client";
import { Box, Button, Divider, Text } from "@/components";

export default function Settings() {
  const keyList = [
    {
      label: "Passkey",
      active: true,
    },
    {
      label: "Phone Number",
      comingSoon: true,
    },
    {
      label: "Telegram Key",
      comingSoon: true,
    },
    {
      label: "Email Recovery Key",
      active: false,
    },
    {
      label: "Ledger/YubiKey",
      active: false,
    },
    {
      label: "Google Authenticator",
      active: false,
    },
  ];
  return (
    <Box className="m-6 h-fit w-1/3 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl">Security Settings</Text>
      <Text size="sm" fontWeight="medium" className="mt-3">
        Add keys to your account. Click any of the options below to update or
        add keys to your account.
      </Text>
      <Box className="mt-3 flex justify-between bg-orange-400">
        <Text size="sm" fontWeight="medium" color="black">
          Keys Required For Transactions
        </Text>
        <Text size="sm" fontWeight="medium" color="black">
          1/1
        </Text>
      </Box>
      <Divider className="my-2" />
      <div className="space-y-2">
        {keyList.map((sigKey) => (
          <Button
            key={sigKey.label}
            variant={sigKey.active ? "confirmed" : "secondary"}
            block
          >
            {!sigKey.active ? "Add " : ""}
            {sigKey.label}
            {sigKey.active ? " Active" : ""}
          </Button>
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
