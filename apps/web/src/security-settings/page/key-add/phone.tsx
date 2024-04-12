import { Box, Button, Divider, Text } from "@/components";
import { PhoneKeyWorkerClient } from "@/keys/intentions-handler/phone";
import { useSecuritySettingsContext } from "@/security-settings/context";
import { PhoneSingleKeyMetaData } from "@/stores/key-meta-data";
import { Input } from "@/ui/input";
import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const AddPhoneKeyPage = observer(function AddPhoneKeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  // TODO: security question
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [sentMagicCode, setSentMagicCode] = useState(false);
  const [code, setCode] = useState("");

  const phoneKeyFlow = useMutation({
    mutationFn: async () => {
      const client = new PhoneKeyWorkerClient({
        to: number,
        answer: securityAnswer,
        via: "sms",
        signHashes: [],
        decryptMessages: [],
      });

      if (sentMagicCode) {
        const response = await client.confirmMagicCode(code);
        const publicKey: Secp256k1PublicKey = {
          type: "tendermint/PubKeySecp256k1",
          value: response.publicKey,
        };
        draft.value.addPhoneKey(publicKey);

        setKeyMetaData(
          publicKey,
          PhoneSingleKeyMetaData.parse({
            name,
            timestamp: DateTime.now().toISO(),
            payload: {
              phoneNumber: number,
              securityQuestion: "FOOBAR",
            },
          }),
        );

        popPage();
      } else {
        await client.requestMagicCode();
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
        {sentMagicCode ? renderMagicCodeForm() : renderDataForm()}
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

  function renderDataForm() {
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

  function renderMagicCodeForm() {
    return (
      <>
        <Input
          label="Magic Code"
          labelClassname="bg-background-secondary"
          className="max-w-96 max-sm:w-full"
          placeholder="12345678"
          value={code}
          onChange={(value) => {
            setCode(value);
          }}
        />
      </>
    );
  }
});
