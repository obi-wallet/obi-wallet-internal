import { Box, Button, Divider, Text } from "@/components";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { KeyItemPage, useSecuritySettingsContext } from "../context";

export const SecuritySettingsKeyItemPage = observer<{ page: KeyItemPage }>(
  function SecuritySettingsKeyItemPage({ page }) {
    const { keyMetaDataDraft, setKeyMetaData, popPage } =
      useSecuritySettingsContext();
    const [name, setName] = useState(
      keyMetaDataDraft.value.value[page.payload.id]?.name ?? "",
    );

    return (
      <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
        <Text size="xl" fontWeight="semibold">
          {`${page.payload.label} Settings`}
        </Text>
        <Divider className="my-2" />
        <div className="mt-3 space-y-2">
          <Input
            label="Name"
            labelClassname="bg-background-secondary"
            className="max-w-96 max-sm:w-full"
            placeholder="Name"
            value={name}
            onChange={(value) => {
              setName(value);
            }}
          />
        </div>
        <div className="mt-40 grid grid-cols-2 gap-8">
          <Button
            variant="secondary"
            block
            onClick={() => {
              popPage();
            }}
          >
            Back
          </Button>
          <Button
            variant="primary"
            block
            onClick={() => {
              setKeyMetaData(page.payload.key.publicKey, {
                name,
              });
              popPage();
            }}
          >
            Save
          </Button>
        </div>
      </Box>
    );
  },
);
