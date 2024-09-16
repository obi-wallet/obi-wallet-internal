import { Box, Button, Divider, Text, DropDown } from "@/components";
import {
  useSecurityQuestionInput,
  useSecurityQuestions,
} from "@/keys/phone/use-security-questions";
import { Input } from "@/ui/input";
import { createPasskey } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { useSecuritySettingsContext } from "../../context";
import useGoogleAuth from "@/hooks/use-google-auth";

export const AddCloudkeyPage = observer(function AddCloudkeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();
  const [name, setName] = useState("");
  const securityQuestion = useSecurityQuestionInput();
  const securityQuestions = useSecurityQuestions();
  const { isSignedIn, uploadFile } = useGoogleAuth();

  const cloudkeyFlow = useMutation({
    mutationFn: async () => {
      // const keyPair = await createPasskey();
      // const passkey = draft.value.addPasskeyKey(keyPair);
      // if (!draft.value.primaryKey) {
      //   draft.value.setPrimaryKey(passkey);
      // }
      // setKeyMetaData(keyPair.publicKey, {
      //   name,
      //   timestamp: DateTime.now().toISO(),
      // });
      // popPage();
      console.log("check", isSignedIn);
      if (isSignedIn) {
        uploadFile("hello world", name, "text/plain");
      }
    },
  });

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Add a New Cloudkey
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
        <DropDown
          className="w-full"
          contentContainerClassname="w-full"
          description="Security Question"
          options={securityQuestions}
          value={securityQuestion.securityQuestion}
          onSelectOption={(value) => {
            securityQuestion.setSecurityQuestion(value.value);
          }}
        />
        <Input
          label="Security Answer"
          labelClassname="bg-background-secondary"
          className="w-full"
          placeholder="Security Answer"
          value={securityQuestion.securityAnswer}
          onChange={(value) => {
            securityQuestion.setSecurityAnswer(value);
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
            cloudkeyFlow.mutate();
          }}
          disabled={!name || !securityQuestion.securityAnswer}
        >
          Next
        </Button>
      </div>
    </Box>
  );
});
