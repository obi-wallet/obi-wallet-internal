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
import { useMutation, useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useState } from "react";

interface AuthenticatorType {
  qrcode: string;
  secret: string;
}

export interface AddAuthenticatorKeyProps {
  onSubmit(payload: {
    publicKey: Secp256k1PublicKey;
    keyMetaData: SingleKeyMetaData;
  }): void;
  onCancel(): void;
}

export const AddAuthenticatorKey = observer<AddAuthenticatorKeyProps>(
  function AddAuthenticatorKey({ onSubmit, onCancel }) {
    const [scannedQrCode, setScannedQrCode] = useState(false);
    const [userToken, setUserToken] = useState("");

    const {
      isPending,
      isError,
      data: qrcodeData,
      error,
    } = useQuery({
      queryKey: ["authenticator-qrcode"],
      queryFn: async (): Promise<AuthenticatorType> => {
        const response = await fetch("/api/authenticator/qrcode");
        if (response.status === 200) {
          const data = await response.json();
          return data;
        } else {
          return Promise.reject(new Error("Something went wrong!"));
        }
      },
    });

    const handleNext = async () => {
      if (scannedQrCode) {
        const response = await fetch("/api/authenticator/verify", {
          method: "POST",
          body: JSON.stringify({
            secret: qrcodeData?.secret,
            token: userToken,
          }),
        });
        if (response.status === 200) {
          const result = (await response.json()) as { verified: boolean };
          console.log({ result });
        } else {
          return Promise.reject(new Error("Something went wrong!"));
        }
      } else {
        setScannedQrCode(true);
      }
    };

    console.log({ isPending, isError, qrcodeData, error });

    return (
      <>
        <div className="mt-6 space-y-2">
          {scannedQrCode ? renderMagicCodeForm() : renderDataForm()}
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
            onClick={handleNext}
            disabled={
              !scannedQrCode ? isPending || isError || !qrcodeData : !userToken
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
          <Text>
            Use a phone app or browser extension like Authy, Google
            Authenticator, etc. to get 2FA codes
          </Text>
          <img src={qrcodeData?.qrcode} alt="2FA QR Code" />
        </div>
      );
    }

    function renderMagicCodeForm() {
      return (
        <Input
          label="Magic Code"
          labelClassname="bg-background-secondary"
          className="max-w-96 max-sm:w-full"
          placeholder="123456"
          value={userToken}
          onChange={(value) => {
            setUserToken(value);
          }}
        />
      );
    }
  },
);
