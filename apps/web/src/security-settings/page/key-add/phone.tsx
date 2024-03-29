import { Box, Button, Divider, Text } from "@/components";
import { useSecuritySettingsContext } from "@/security-settings/context";
import { Input } from "@/ui/input";
import { createPasskey, Sdk } from "@obi-wallet/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const AddPhoneKeyPage = observer(function AddPhoneKeyPage() {
  const queryClient = useQueryClient();
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  // TODO: security question
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [sentMagicCode, setSentMagicCode] = useState(false);
  const [code, setCode] = useState("");

  const phoneKeyFlow = useMutation({
    mutationFn: async () => {
      if (sentMagicCode) {
        // TODO: add phone key
        // const keyPair = await createPasskey();
        // draft.value.addPasskeyKey(keyPair);
        //
        // await queryClient.prefetchQuery(
        //   Sdk.chainId(draft.value.chainId).transactions.prepareKeyPairQuery(
        //     keyPair,
        //   ),
        // );
        // setKeyMetaData(keyPair.publicKey, {
        //   name,
        // });
        popPage();
      } else {
        // TODO: send magic code
        setSentMagicCode(true);
      }
    },
  });

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Add a New Phone Key
      </Text>
      <Divider className="my-2" />
      <div className="mt-3 space-y-2">
        {sentMagicCode ? <MagicCodeForm /> : <DataForm />}
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
            phoneKeyFlow.mutate();
          }}
        >
          Save
        </Button>
      </div>
    </Box>
  );

  function DataForm() {
    return (
      <>
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
        <Input
          label="Phone Number"
          labelClassname="bg-background-secondary"
          className="max-w-96 max-sm:w-full"
          placeholder="+491234567"
          value={number}
          onChange={(value) => {
            setNumber(value);
          }}
        />
        <Input
          label="Security Answer"
          labelClassname="bg-background-secondary"
          className="max-w-96 max-sm:w-full"
          placeholder="Security Answer"
          value={securityAnswer}
          onChange={(value) => {
            setSecurityAnswer(value);
          }}
        />
      </>
    );
  }

  function MagicCodeForm() {
    return (
      <>
        <Input
          label="Magic Code"
          labelClassname="bg-background-secondary"
          className="max-w-96 max-sm:w-full"
          placeholder="Magic Code"
          value={code}
          onChange={(value) => {
            setCode(value);
          }}
        />
      </>
    );
  }
});
