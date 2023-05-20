import { CheckIcon, Key, useEnv } from "@obi-wallet/common";
import {
  SignAndBroadcastTransactionType,
  useQuery,
  useSignAndBroadcastTransaction,
} from "@obi-wallet/headless-ui";
import { KeySubclassTypeMapping, KeyType, Signer } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";

import { MultisigConfirmMessages } from "./multisig-confirm-messages";
import { PhoneNumberBottomSheetContent } from "./phone-number-bottom-sheet-content";
import { createUsableSigners, PhoneKeySigner } from "./signers";
import {
  BottomSheet,
  BottomSheetRef,
} from "../../screens/components/bottom-sheet";

export type SignatureModalMultisigKeyProps = ReturnType<
  typeof useSignAndBroadcastTransaction
> & {
  type: SignAndBroadcastTransactionType.MultisigKey;
};

export const SignatureModalMultisigKey =
  observer<SignatureModalMultisigKeyProps>(function SignatureModalMultisigKey({
    interaction,
    messages,
    cancel,
    broadcast,
    multisigSigner,
    multisigKey,
    safeSpendLimitExceeded,
  }) {
    const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
    const env = useEnv();

    const usableSigners = useQuery({
      queryKey: ["usable-signers"],
      queryFn: async () => {
        return await createUsableSigners({
          multisigKey,
          demoMode: interaction.payload.demoMode,
          bottomSheetRef: phoneNumberBottomSheetRef,
          env,
        });
      },
      cacheTime: 0,
    });

    const [_, setOrderedSignatures] = useState<unknown[]>([]);
    const addSigner = async (signer: Signer) => {
      const ms = await multisigSigner.getAsync();
      await ms.addSigner(signer);
      setOrderedSignatures(ms.orderedSignatures ?? []);
    };

    if (!multisigKey.threshold || !usableSigners.data) return null;

    const keys: Key[] = usableSigners.data.map(({ key, signer }) => {
      const alreadySigned = multisigSigner.current?.alreadySigned(
        key.publicKey
      );
      const onPress = async () => {
        if (multisigSigner.current?.alreadySigned(key.publicKey)) {
          return;
        }
        try {
          await addSigner(signer);
        } catch (e) {
          // noop
        }
      };

      return {
        type: key.type,
        signed: alreadySigned,
        right: alreadySigned ? <CheckIcon /> : null,
        onPress,
      };
    });

    const phoneKeyPayload = usableSigners.data.find(
      (
        payload
      ): payload is {
        key: KeySubclassTypeMapping[KeyType.Phone];
        signer: PhoneKeySigner;
      } => {
        return payload.key.type === KeyType.Phone;
      }
    );

    return (
      <MultisigConfirmMessages
        footer={
          phoneKeyPayload ? (
            <BottomSheet
              bottomSheetRef={phoneNumberBottomSheetRef}
              onClose={() => {
                phoneKeyPayload.signer.cancelSignature();
              }}
            >
              <PhoneNumberBottomSheetContent
                phoneNumber={phoneKeyPayload.key.payload.phoneNumber}
                securityQuestion={phoneKeyPayload.key.payload.securityQuestion}
                onRequest={async (securityAnswer) => {
                  await phoneKeyPayload.signer.requestSignature(securityAnswer);
                }}
                onConfirm={async (key) => {
                  await phoneKeyPayload.signer.confirmSignature(key);
                }}
              />
            </BottomSheet>
          ) : null
        }
        threshold={multisigKey.threshold}
        numberOfSignatures={multisigSigner.current?.numberOfSignatures || 0}
        numberOfUsableKeys={usableSigners.data.length}
        innerMessages={messages}
        chainId={multisigKey.chainId}
        data={keys}
        safeSpendLimitExceeded={safeSpendLimitExceeded}
        onCancel={cancel}
        onConfirm={async () => {
          await broadcast.mutateAsync();
        }}
      />
    );
  });
