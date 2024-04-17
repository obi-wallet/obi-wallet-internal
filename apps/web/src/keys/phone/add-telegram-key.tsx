import { Button } from "@/components";
import { PhoneKeyWorkerClient } from "@/keys/intentions-handler";
import {
  SingleKeyMetaData,
  TelegramSingleKeyMetaData,
} from "@/stores/key-meta-data";
import { Input } from "@/ui/input";
import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
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
    // TODO: security question
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [sentMagicCode, setSentMagicCode] = useState(false);
    const [code, setCode] = useState("");

    const telegramKeyFlow = useMutation({
      mutationFn: async () => {
        const client = new PhoneKeyWorkerClient({
          to: chatId,
          answer: securityAnswer,
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
                securityQuestion: "FOOBAR",
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
            label="Chat ID"
            labelClassname="bg-background-secondary"
            className="max-w-96 max-sm:w-full"
            placeholder="123456789"
            value={chatId}
            onChange={(value) => {
              setChatId(value);
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
