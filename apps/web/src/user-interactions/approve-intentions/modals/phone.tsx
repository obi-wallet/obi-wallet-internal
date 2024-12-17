import { Button, DropDown, KeyItem, Modal, Text } from "@/components";
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
import { useState, useEffect } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

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
    const [retryCountdown, setRetryCountdown] = useState(0);
    const [lastError, setLastError] = useState<string | null>(null);
    const [isVoiceCall, setIsVoiceCall] = useState(false);

    useEffect(() => {
      if (retryCountdown > 0) {
        const timer = setTimeout(() => {
          setRetryCountdown(retryCountdown - 1);
        }, 1000);
        return () => {
          return clearTimeout(timer);
        };
      }
    }, [retryCountdown]);

    const result = z
      .union([PhoneSingleKeyMetaData, TelegramSingleKeyMetaData])
      .safeParse(keyItem.keyMetaData);
    invariant(result.success, "Invalid key metadata");

    const getSecurityQuestion = () => {
      const securityQuestion = securityQuestions.find((question) => {
        return question.value === result.data.payload.securityQuestion;
      });
      return securityQuestion || securityQuestions[0]!;
    };
    const securityQuestion = getSecurityQuestion();

    const needsTo = !keyItem.keyMetaData.payload;

    const confirm = useMutation({
      mutationFn: async (via: "sms" | "voice" | "telegram" = "sms") => {
        function getKeyMetaData() {
          if (needsTo && keyItem.key.type === KeyType.Phone) {
            return PhoneSingleKeyMetaData.parse({
              ...keyItem.keyMetaData,
              payload: {
                phoneNumber: to,
                securityQuestion: securityQuestion.value,
              },
            });
          }

          if (needsTo && keyItem.key.type === KeyType.Telegram) {
            return TelegramSingleKeyMetaData.parse({
              ...keyItem.keyMetaData,
              payload: {
                chatId: to,
                securityQuestion: securityQuestion.value,
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

        if (!code) {
          // If no code is provided, this is an initial request
          try {
            const requestVia =
              keyItem.key.type === KeyType.Telegram ? "telegram" : via;
            await intentionsHandler.requestMagicCode(requestVia);
            setSentMagicCode(true);
            setRetryCountdown(30);
            setLastError(null);
            if (via === "voice") {
              setIsVoiceCall(true);
            }
          } catch (error) {
            console.error("Error requesting magic code:", error);
            setLastError("Failed to send magic code");
            throw error;
          }
        } else {
          // If code is provided, this is a confirmation
          return onResult(await intentionsHandler.confirmMagicCode(code));
        }
      },
      onError(error) {
        console.error(error);
        setLastError("Failed to process request");
      },
    });

    const handleVoiceCall = () => {
      setLastError(null);
      setCode(""); // Clear any existing code
      confirm.mutate("voice");
    };

    const handleCodeChange = (value: string) => {
      // Only allow digits and limit to 8 characters
      const sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 8);
      setCode(sanitizedValue);
    };

    return (
      <Modal
        title={keyItem.label}
        onClose={onCancel}
        boxClassname="h-fit !min-w-[320px] px-4 py-6 w-full bg-[#1c1c1c] bg-opacity-95 backdrop-blur-sm"
      >
        {sentMagicCode ? (
          <>
            {lastError ? (
              <>
                <Text className="text-sm text-gray-300">
                  {keyItem.key.type === KeyType.Phone
                    ? "Your carrier was unable to receive an SMS message."
                    : "There was an error sending your Telegram message."}
                </Text>
                <Text className="text-sm text-gray-300">
                  {retryCountdown > 0 ? (
                    `Try again in ${retryCountdown} seconds.`
                  ) : (
                    <button
                      onClick={() => {
                        return confirm.mutate(
                          keyItem.key.type === KeyType.Phone
                            ? "sms"
                            : "telegram",
                        );
                      }}
                      className="text-primary hover:text-primary/80 hover:underline"
                    >
                      Try again
                    </button>
                  )}
                </Text>
                {keyItem.key.type === KeyType.Phone ? (
                  <Text className="text-sm text-gray-300">
                    <button
                      onClick={handleVoiceCall}
                      className="text-primary hover:text-primary/80 hover:underline"
                    >
                      Receive a voice call instead
                    </button>
                  </Text>
                ) : null}
              </>
            ) : isVoiceCall ? (
              <>
                <Text className="text-sm text-gray-300">
                  Calling{" "}
                  {needsTo
                    ? to
                    : "phoneNumber" in result.data.payload
                      ? result.data.payload.phoneNumber
                      : ""}{" "}
                  now. Enter your Magic Obi code below.
                </Text>
                <Text className="text-sm text-gray-300">
                  {retryCountdown > 0 ? (
                    `If you don't receive a call, try again in ${retryCountdown} seconds.`
                  ) : (
                    <button
                      onClick={handleVoiceCall}
                      className="text-primary hover:text-primary/80 hover:underline"
                    >
                      If you don't receive a call, try again.
                    </button>
                  )}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-sm text-gray-300">
                  {retryCountdown > 0 ? (
                    `Resend your magic code in ${retryCountdown} seconds.`
                  ) : (
                    <button
                      onClick={() => {
                        return confirm.mutate(
                          keyItem.key.type === KeyType.Phone
                            ? "sms"
                            : "telegram",
                        );
                      }}
                      className="text-primary hover:text-primary/80 hover:underline"
                    >
                      Resend your magic code
                    </button>
                  )}
                </Text>
                {keyItem.key.type === KeyType.Phone ? (
                  <Text className="text-sm text-gray-300">
                    <button
                      onClick={handleVoiceCall}
                      className="text-primary hover:text-primary/80 hover:underline"
                    >
                      Try a voice call instead
                    </button>
                  </Text>
                ) : null}
              </>
            )}
            <Input
              labelClassname="bg-background-secondary"
              className="h-standardField mt-4 max-w-96 max-sm:w-full"
              placeholder="12345678"
              value={code}
              onChange={handleCodeChange}
            />
          </>
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
              className="text-md max-w-96 max-sm:w-full [&[aria-disabled=true]]:select-none [&[aria-disabled=true]]:appearance-none"
              contentContainerClassname="max-w-96 max-sm:w-full"
              description="Security Question"
              options={securityQuestions}
              value={securityQuestion.value}
              disabled
            />
            <Input
              labelClassname="bg-background-secondary"
              className="h-standardField max-w-96 max-sm:w-full"
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
                setIsVoiceCall(false);
                setCode("");
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
            disabled={confirm.isPending || (sentMagicCode && code.length !== 8)}
            onClick={() => {
              const via =
                keyItem.key.type === KeyType.Phone
                  ? isVoiceCall
                    ? "voice"
                    : "sms"
                  : "telegram";
              confirm.mutate(via);
            }}
          >
            {sentMagicCode ? "Confirm" : "Next"}
          </Button>
        </div>
      </Modal>
    );
  },
);
