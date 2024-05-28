import { Button, DropDown, Text } from "@/components";
import { PhoneKeyWorkerClient } from "@/keys/intentions-handler";
import {
  useSecurityQuestionInput,
  useSecurityQuestions,
} from "@/keys/phone/use-security-questions";
import {
  SingleKeyMetaData,
  TelegramSingleKeyMetaData,
} from "@/stores/key-meta-data";
import { Input } from "@/ui/input";
import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useState } from "react";

export interface AddTelegramKeyProps {
  onSubmit(payload: {
    publicKey: Secp256k1PublicKey;
    keyMetaData: SingleKeyMetaData;
  }): void;
  onCancel(): void;
  askForName: boolean;
}

export const AddTelegramKey = observer<AddTelegramKeyProps>(
  function AddTelegramKey({ onSubmit, onCancel, askForName }) {
    const [name, setName] = useState("");
    const [chatId, setChatId] = useState("");
    const securityQuestion = useSecurityQuestionInput();
    const securityQuestions = useSecurityQuestions();
    const [sentMagicCode, setSentMagicCode] = useState(false);
    const [code, setCode] = useState("");

    const telegramKeyFlow = useMutation({
      mutationFn: async () => {
        const client = new PhoneKeyWorkerClient({
          to: chatId,
          answer: securityQuestion.securityAnswer,
          via: "telegram",
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
            keyMetaData: TelegramSingleKeyMetaData.parse({
              name,
              timestamp: DateTime.now().toISO(),
              payload: {
                chatId: chatId,
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
              telegramKeyFlow.mutate();
            }}
            disabled={
              sentMagicCode
                ? !code
                : !(!askForName || name) ||
                  !chatId ||
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
            <Input
              label="Key Name"
              labelClassname="bg-background-secondary"
              className="w-full"
              placeholder="Name"
              value={name}
              onChange={(value) => {
                setName(value);
              }}
            />
          ) : null}
          <Text>
            To find out your Chat ID, initiate chat with our Telegram bot:
          </Text>
          <Text>
            <Link href="https://t.me/Obi_telegram_bot" target="_blank">
              https://t.me/Obi_telegram_bot
            </Link>
          </Text>
          <Input
            label="Chat ID"
            labelClassname="bg-background-secondary"
            className="w-full"
            placeholder="123456789"
            value={chatId}
            onChange={(value) => {
              setChatId(value);
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
  },
);
