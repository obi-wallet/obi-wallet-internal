import { Box, Button, Divider, Text } from "@/components";
import { useSecuritySettingsContext } from "@/security-settings/context";
import { Input } from "@/ui/input";
import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const AddTelegramKeyPage = observer(function AddTelegramKeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();
  const [name, setName] = useState("");
  const [chatId, setChatId] = useState("");
  // TODO: security question
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [sentMagicCode, setSentMagicCode] = useState(false);
  const [code, setCode] = useState("");

  const phoneKeyFlow = useMutation({
    mutationFn: async () => {
      if (sentMagicCode) {
        const response = await fetch(
          `https://phone-keys.obiwallet.workers.dev/handle?code=${code}`,
          {
            method: "POST",
            body: JSON.stringify({
              to: chatId,
              answer: securityAnswer,
              via: "telegram",
              signHashes: [],
              decryptMessages: [],
            }),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch public key");
        }
        const body = (await response.json()) as { publicKey: string };

        const publicKey: Secp256k1PublicKey = {
          type: "tendermint/PubKeySecp256k1",
          value: body.publicKey,
        };

        draft.value.addTelegramKey({
          publicKey,
          chatId: chatId,
          securityQuestion: "FOOBAR",
        });

        setKeyMetaData(publicKey, {
          name,
          timestamp: DateTime.now().toISO(),
        });

        popPage();
      } else {
        const response = await fetch(
          "https://phone-keys.obiwallet.workers.dev/handle",
          {
            method: "POST",
            body: JSON.stringify({
              to: chatId,
              answer: securityAnswer,
              via: "telegram",
              signHashes: [],
              decryptMessages: [],
            }),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to send magic code");
        }
        setSentMagicCode(true);
      }
    },
  });

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Add a New Telegram Key
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
          label="Chat ID"
          labelClassname="bg-background-secondary"
          className="max-w-96 max-sm:w-full"
          placeholder="+491234567"
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
          placeholder="Magic Code"
          value={code}
          onChange={(value) => {
            setCode(value);
          }}
        />
      </>
    );
  }
});
