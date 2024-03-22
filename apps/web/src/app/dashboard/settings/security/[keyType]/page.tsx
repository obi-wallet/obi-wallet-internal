"use client";
import { Box, Button, Divider, Text } from "@/components";
import { MOCK_KEY_LIST } from "@/mocks/keys";

export default function SecurityKeySettings({
  params,
}: {
  params: { keyType: string };
}) {
  const { keyType } = params;

  const keyData = MOCK_KEY_LIST.find((item) => item.type === keyType);

  if (!keyData) return null;

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        {`${keyData.label} Settings`}
      </Text>
      <Text size="sm" fontWeight="light" className="mt-3">
        {`Update or name your ${keyData.type} keys.`}
      </Text>
      <Divider className="my-2" />
      <div className="space-y-2">
        {keyData.keys.map((sigKey) => (
          <Button key={sigKey.id} variant="secondary" block>
            {sigKey.label}
          </Button>
        ))}
      </div>
      <Button variant="outline" block className="mt-6 border-dashed">
        Add New Key
      </Button>
      <div className="mt-40 grid grid-cols-2 gap-8">
        <Button variant="secondary" block href="/dashboard/settings/security">
          Back
        </Button>
        <Button variant="primary" block>
          Save
        </Button>
      </div>
    </Box>
  );
}
