"use client";
import { Box, Button, Divider, KeyListItem, Text } from "@/components";
import { MOCK_KEY_LIST } from "@/mocks/keys";

export default function SecuritySettings() {
  const keyList = MOCK_KEY_LIST;
  const mandatoryKey = keyList.find((item) => item.mandatory);

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
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
          <KeyListItem
            key={sigKey.type}
            keyData={sigKey}
            href={`/dashboard/settings/security/${sigKey.type}`}
          />
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
