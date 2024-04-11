import { Button, KeyItem, Modal } from "@/components";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PhoneKeyIntentionsHandler } from "@/keys/intentions-handler/phone";
import { IntentionsPayload, IntentionsResult } from "@/keys/intentions-handler";

export interface PhoneKeyModalProps {
  keyItem: KeyItem;
  index: number;
  intentions: IntentionsPayload;
  onCancel(): void;
  onResult(result: IntentionsResult): void;
  //& {
  //   key:
  //     | KeySubclassTypeMapping[KeyType.Phone]
  //     | KeySubclassTypeMapping[KeyType.Telegram];
  // };
}

export const PhoneKeyModal = observer<PhoneKeyModalProps>(
  function PhoneKeyModal({ keyItem, index, intentions, onCancel, onResult }) {
    const [sentMagicCode, setSentMagicCode] = useState(false);
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [code, setCode] = useState("");

    // TODO: check if usable

    const confirm = useMutation({
      mutationFn: async () => {
        console.log("trying");
        const intentionsHandler = new PhoneKeyIntentionsHandler({
          // @ts-expect-error
          key: keyItem.key,
          index,
          payload: intentions,
          answer: securityAnswer,
        });
        console.log("confirming");

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
            placeholder="Security Answer"
            value={code}
            onChange={(value) => {
              setCode(value);
            }}
          />
        ) : (
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
