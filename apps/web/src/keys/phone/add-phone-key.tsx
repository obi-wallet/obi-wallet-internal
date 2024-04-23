import { Button, DropDown } from "@/components";
import { PhoneKeyWorkerClient } from "@/keys/intentions-handler";
import {
  useSecurityQuestionInput,
  useSecurityQuestions,
} from "@/keys/phone/use-security-questions";
import {
  PhoneSingleKeyMetaData,
  SingleKeyMetaData,
} from "@/stores/key-meta-data";
import { Input } from "@/ui/input";
import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export interface AddPhoneKeyProps {
  onSubmit(payload: {
    publicKey: Secp256k1PublicKey;
    keyMetaData: SingleKeyMetaData;
  }): void;
  onCancel(): void;
  askForName: boolean;
}

export const AddPhoneKey = observer<AddPhoneKeyProps>(function AddPhoneKey({
  onSubmit,
  onCancel,
  askForName,
}) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const securityQuestion = useSecurityQuestionInput();
  const securityQuestions = useSecurityQuestions();
  const [sentMagicCode, setSentMagicCode] = useState(false);
  const [code, setCode] = useState("");

  const phoneKeyFlow = useMutation({
    mutationFn: async () => {
      const client = new PhoneKeyWorkerClient({
        to: number,
        answer: securityQuestion.securityAnswer,
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

        onSubmit({
          publicKey,
          keyMetaData: PhoneSingleKeyMetaData.parse({
            name,
            timestamp: DateTime.now().toISO(),
            payload: {
              phoneNumber: number,
              securityQuestion: securityQuestion.securityQuestion,
            },
          }),
        });
      } else {
        await client.requestMagicCode();
        setSentMagicCode(true);
      }
    },
  });

  return (
    <>
      <div className="mt-6 space-y-2">
        {sentMagicCode ? renderMagicCodeForm() : renderDataForm()}
      </div>
      <div className="mt-40 grid grid-cols-2 gap-8">
        <Button
          variant="secondary"
          block
          onClick={() => {
            onCancel();
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
    </>
  );

  function renderDataForm() {
    return (
      <div className="flex flex-col gap-4">
        {askForName ? (
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
        ) : null}
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
        <DropDown
          className="max-w-96 max-sm:w-full"
          contentContainerClassname="max-w-96 max-sm:w-full"
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
          className="max-w-96 max-sm:w-full"
          placeholder="Security Answer"
          value={securityQuestion.securityAnswer}
          onChange={(value) => {
            securityQuestion.setSecurityAnswer(value);
          }}
        />
      </div>
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
