import {
  SignAndBroadcastTransactionType,
  useQuery,
  useSignAndBroadcastTransaction,
} from "@obi-wallet/headless-ui";
import {
  CommunicationType,
  KeySubclassTypeMapping,
  KeyType,
  Signer,
} from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import {
  MultisigConfirmMessages,
  MultisigConfirmMessagesLogin,
} from "./multisig-confirm-messages";
import { PhoneNumberBottomSheetContent } from "./phone-number-bottom-sheet-content";
import { createUsableSigners, PhoneKeySigner } from "./signers";
import { useEnv } from "../../../contexts";
import { BottomSheetNew } from "../../bottom-sheet";
import { CheckIcon } from "../../icons";
import { Key } from "../../multisig-settings";

export type SignatureModalMultisigKeyProps = ReturnType<
  typeof useSignAndBroadcastTransaction
> & {
  type: SignAndBroadcastTransactionType.MultisigKey;
  hint?: string;
};

export const SignatureModalMultisigKey =
  observer<SignatureModalMultisigKeyProps>(function SignatureModalMultisigKey({
    interaction,
    messages,
    cancel,
    broadcast,
    multisigSigner,
    multisigKey,
    hint,
    safeSpendLimitExceeded,
  }) {
    const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
    const env = useEnv();

    const usableSigners = useQuery({
      queryKey: ["usable-signers"],
      queryFn: async () => {
        return await createUsableSigners({
          multisigKey,
          demoMode: interaction.payload.demoMode,
          openBottomSheet: () => {
            setBottomSheetOpen(true);
          },
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
        key.publicKey,
      );
      const onPress = async () => {
        if (multisigSigner.current?.alreadySigned(key.publicKey)) {
          return;
        }
        try {
          if (key.type === KeyType.Phone) {
            setBottomSheetOpen(true);
          }
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
        payload,
      ): payload is {
        key: KeySubclassTypeMapping[KeyType.Phone];
        signer: PhoneKeySigner;
      } => {
        return payload.key.type === KeyType.Phone;
      },
    );
    const getFooter = () => {
      if (!phoneKeyPayload) return null;
      return (
        <BottomSheetNew
          open={bottomSheetOpen}
          onClose={() => {
            phoneKeyPayload.signer.cancelSignature();
            setBottomSheetOpen(false);
          }}
        >
          <PhoneNumberBottomSheetContent
            phoneNumber={phoneKeyPayload.key.payload.phoneNumber}
            securityQuestion={phoneKeyPayload.key.payload.securityQuestion}
            onRequest={async (data: {
              securityAnswer: string;
              type: CommunicationType;
            }) => {
              setBottomSheetOpen(true);
              await phoneKeyPayload.signer.requestSignature(data);
            }}
            onConfirm={async (key) => {
              await phoneKeyPayload.signer.confirmSignature(key);
              setBottomSheetOpen(false);
            }}
          />
        </BottomSheetNew>
      );
    };
    const Component = interaction.payload.isLogin
      ? MultisigConfirmMessagesLogin
      : MultisigConfirmMessages;

    return (
      <Component
        footer={getFooter()}
        threshold={multisigKey.threshold}
        numberOfSignatures={multisigSigner.current?.numberOfSignatures || 0}
        numberOfUsableKeys={usableSigners.data.length}
        innerMessages={messages}
        chainId={multisigKey.chainId}
        hint={hint}
        data={keys}
        safeSpendLimitExceeded={safeSpendLimitExceeded}
        onCancel={cancel}
        onConfirm={async () => {
          await broadcast.mutateAsync();
        }}
      />
    );
  });
