import { Box, Button, Divider, Text } from "@/components";
import { Input } from "@/ui/input";
import { createPasskey } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { useSecuritySettingsContext } from "../../context";

export const AddPasskeyPage = observer(function AddPasskeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();
  const [name, setName] = useState("");

  const passkeyFlow = useMutation({
    mutationFn: async () => {
      const keyPair = await createPasskey();
      const passkey = draft.value.addPasskeyKey(keyPair);
      if (!draft.value.primaryKey) {
        draft.value.setPrimaryKey(passkey);
      }
      setKeyMetaData(keyPair.publicKey, {
        name,
        timestamp: DateTime.now().toISO(),
      });
      popPage();
    },
  });

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Add a New Passkey
      </Text>
      <Divider className="my-2" />
      <div className="mt-3 space-y-2">
        <Input
          label="Name"
          labelClassname="bg-background-secondary"
          className="w-full"
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
            passkeyFlow.mutate();
          }}
          disabled={!name}
        >
          Next
        </Button>
      </div>
    </Box>
  );
});
