import { Button, DropDown } from "@/components";
import { InfoIcon } from "@/components/info-icon";
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
          disabled={
            sentMagicCode
              ? !code
              : !(!askForName || name) ||
                !number ||
                !securityQuestion.securityAnswer
          }
        >
          Next
        </Button>
      </div>
    </>
  );

  function renderDataForm() {
    return (
      <div className="flex flex-col gap-4">
        {askForName ? (
          <div className="flex items-center gap-2">
            <Input
              labelClassname="bg-background-secondary"
              className="h-standardField w-full"
              placeholder="Name"
              value={name}
              onChange={(value) => {
                setName(value);
              }}
            />
            <InfoIcon topicId="phone_key_name_info" />
          </div>
        ) : null}
        <Input
          labelClassname="bg-background-secondary"
          className="h-standardField w-full"
          placeholder="+491234567"
          value={number}
          onChange={(value) => {
            setNumber(value);
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
        <div className="flex items-center gap-2">
          <Input
            labelClassname="bg-background-secondary"
            className="h-standardField w-full"
            placeholder="Security Answer"
            value={securityQuestion.securityAnswer}
            onChange={(value) => {
              securityQuestion.setSecurityAnswer(value);
            }}
          />
          <InfoIcon topicId="security_answer_info" />
        </div>
      </div>
    );
  }

  function renderMagicCodeForm() {
    return (
      <>
        <Input
          labelClassname="h-standardField bg-background-secondary"
          className="w-full"
          placeholder="Enter Magic SMS Code"
          value={code}
          onChange={(value) => {
            setCode(value);
          }}
        />
      </>
    );
  }
});
