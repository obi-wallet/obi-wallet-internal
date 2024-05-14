import { Button, DropDown, KeyItem, Modal } from "@/components";
import {
  IntentionsPayload,
  IntentionsResult,
  PhoneKeyIntentionsHandler,
} from "@/keys/intentions-handler";
import { useSecurityQuestions } from "@/keys/phone/use-security-questions";
import {
  PhoneSingleKeyMetaData,
  TelegramSingleKeyMetaData,
} from "@/stores/key-meta-data";
import { Input } from "@/ui/input";
import { KeyType } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";

export interface PhoneKeyModalProps {
  keyItem: KeyItem;
  index: number;
  intentions: IntentionsPayload;
  onCancel(): void;
  onResult(result: IntentionsResult): void;
}

export const PhoneKeyModal = observer<PhoneKeyModalProps>(
  function PhoneKeyModal({ keyItem, index, intentions, onCancel, onResult }) {
    const [sentMagicCode, setSentMagicCode] = useState(false);
    const [securityAnswer, setSecurityAnswer] = useState("");
    const securityQuestions = useSecurityQuestions();
    const [code, setCode] = useState("");
    const [to, setTo] = useState("");

    const result = PhoneSingleKeyMetaData.safeParse(keyItem.keyMetaData);
    invariant(result.success, "Invalid key metadata");

    const securityQuestionIndex =
      securityQuestions.findIndex((question) => {
        return question.value === result.data.payload.securityQuestion;
      }) ?? 0;
    const securityQuestion = securityQuestions[securityQuestionIndex]!;
    const needsTo = !keyItem.keyMetaData.payload;

    const confirm = useMutation({
      mutationFn: async () => {
        function getKeyMetaData() {
          if (needsTo && keyItem.key.type === KeyType.Phone) {
            return PhoneSingleKeyMetaData.parse({
              ...keyItem.keyMetaData,
              payload: {
                phoneNumber: to,
                securityQuestion: "",
              },
            });
          }

          if (needsTo && keyItem.key.type === KeyType.Telegram) {
            return TelegramSingleKeyMetaData.parse({
              ...keyItem.keyMetaData,
              payload: {
                chatId: to,
                securityQuestion: "",
              },
            });
          }

          return keyItem.keyMetaData;
        }

        const intentionsHandler = new PhoneKeyIntentionsHandler({
          key: keyItem.key,
          keyMetaData: getKeyMetaData(),
          index,
          payload: intentions,
          answer: securityAnswer,
        });

        if (sentMagicCode) {
          onResult(await intentionsHandler.confirmMagicCode(code));
        } else {
          await intentionsHandler.requestMagicCode();
          setSentMagicCode(true);
        }
      },
      onError(error) {
        console.error(error);
      },
    });

    return (
      <Modal title={keyItem.label} onClose={onCancel}>
        {sentMagicCode ? (
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
        ) : (
          <>
            {needsTo ? (
              <Input
                label={
                  keyItem.key.type === KeyType.Phone
                    ? "Phone Number"
                    : "Chat ID"
                }
                labelClassname="bg-background-secondary"
                className="max-w-96 max-sm:w-full"
                placeholder={
                  keyItem.key.type === KeyType.Phone ? "+491234567" : "Chat ID"
                }
                value={to}
                onChange={(value) => {
                  setTo(value);
                }}
              />
            ) : null}
            <DropDown
              className="max-w-96 max-sm:w-full"
              contentContainerClassname="max-w-96 max-sm:w-full"
              description="Security Question"
              options={securityQuestions}
              value={securityQuestion.value}
              disabled
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
        )}
        <div className="mt-40 grid grid-cols-2 gap-8">
          <Button
            variant="secondary"
            block
            onClick={() => {
              if (sentMagicCode) {
                setSentMagicCode(false);
              } else {
                onCancel();
              }
            }}
          >
            Back
          </Button>
          <Button
            variant="primary"
            block
            disabled={confirm.isPending}
            onClick={() => {
              confirm.mutate();
            }}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    );
  },
);
