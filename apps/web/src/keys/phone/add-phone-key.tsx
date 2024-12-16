import { Button, DropDown, Text } from "@/components";
import { InfoIcon } from "@/components/info-icon";
import { PhoneKeyWorkerClient } from "@/keys/intentions-handler";
import {
  useSecurityQuestionInput,
  useSecurityQuestions,
} from "@/keys/phone/use-security-questions";
import { cn } from "@/lib/utils";
import {
  PhoneSingleKeyMetaData,
  SingleKeyMetaData,
} from "@/stores/key-meta-data";
import { Input } from "@/ui/input";
import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";

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
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => {return clearTimeout(timer)};
    }
  }, [retryCountdown]);

  const phoneKeyFlow = useMutation({
    mutationFn: async (via: "sms" | "voice" = "sms") => {
      const client = new PhoneKeyWorkerClient({
        to: number,
        answer: securityQuestion.securityAnswer,
        via,
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
        try {
          await client.requestMagicCode();
          setSentMagicCode(true);
          setRetryCountdown(30);
          setLastError(null);
        } catch (error) {
          setLastError("Failed to send magic code");
          throw error;
        }
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
            phoneKeyFlow.mutate("sms");
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
        {lastError ? (
          <Text className="text-sm text-gray-300">
            Your provider was unable to receive a Magic SMS. You can{" "}
            <button
              onClick={() => {return phoneKeyFlow.mutate("sms")}}
              disabled={retryCountdown > 0}
              className={cn(
                "text-primary hover:text-primary/80 hover:underline",
                retryCountdown > 0 && "cursor-not-allowed opacity-50",
              )}
            >
              retry
            </button>{" "}
            in {retryCountdown} seconds or{" "}
            <button
              onClick={() => {return phoneKeyFlow.mutate("voice")}}
              className="text-primary hover:text-primary/80 hover:underline"
            >
              receive a voice call instead
            </button>
            .
          </Text>
        ) : (
          <>
            <Text className="text-sm text-gray-300">
              {retryCountdown > 0 ? (
                <>Resend your magic code in {retryCountdown} seconds</>
              ) : (
                <button
                  onClick={() => {return phoneKeyFlow.mutate("sms")}}
                  className="text-primary hover:text-primary/80 hover:underline"
                >
                  Resend your magic code
                </button>
              )}
            </Text>
            <Text className="text-sm text-gray-300">
              <button
                onClick={() => {return phoneKeyFlow.mutate("voice")}}
                className="text-primary hover:text-primary/80 hover:underline"
              >
                Can't receive an SMS? Get a voice call instead
              </button>
            </Text>
          </>
        )}
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
