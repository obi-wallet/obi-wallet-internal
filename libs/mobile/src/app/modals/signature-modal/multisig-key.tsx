import {
  KeySubclassTypeMapping,
  KeyType,
  MultisigKey,
  MultisigSigner,
  Sdk,
  Signer,
} from "@obi-wallet/sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import invariant from "tiny-invariant";

import { AbstractSignatureModalProps, wrapMessages } from "./common";
import { MultisigConfirmMessages } from "./multisig-confirm-messages";
import { PhoneNumberBottomSheetContent } from "./phone-number-bottom-sheet-content";
import { createUsableSigners, PhoneKeySigner } from "./signers";
import {
  BottomSheet,
  BottomSheetRef,
} from "../../screens/components/bottom-sheet";
import { CheckIcon, Key } from "../../screens/components/keys-list";

export interface SignatureModalMultisigKeyProps
  extends AbstractSignatureModalProps {
  multisigKey: MultisigKey;
  proxyAddress?: string;
  safeSpendLimitExceeded?: boolean;
}

export const SignatureModalMultisigKey =
  observer<SignatureModalMultisigKeyProps>(function SignatureModalMultisigKey({
    interaction,
    multisigKey,
    proxyAddress,
    safeSpendLimitExceeded,
  }) {
    const { payload } = interaction;
    const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
    const sender = multisigKey.address;
    const innerMessages = payload.messages;
    const messages = wrapMessages({
      messages: innerMessages,
      proxyAddress,
      sender,
    });

    const { multisigSigner, setMultisigSigner, addSigner } =
      useMultisigSigner();

    const signer = useMutation({
      mutationFn: async () => {
        return await multisigKey.createSigner({
          messages,
        });
      },
      onSuccess(multisigSigner) {
        setMultisigSigner(multisigSigner);
      },
      onError(error) {
        const e = error as Error;
        Alert.alert("Transaction failed", e.message, [
          {
            text: "Cancel",
            onPress: () => {
              interaction.resolve({ approved: false });
            },
          },
        ]);
      },
      retry: 2,
    });

    const usableSigners = useQuery({
      queryKey: ["usable-signers"],
      queryFn: async () => {
        return await createUsableSigners({
          multisigKey,
          demoMode: payload.demoMode,
          bottomSheetRef: phoneNumberBottomSheetRef,
        });
      },
      cacheTime: 0,
    });

    useEffect(() => {
      signer.mutate();
      // We only want to run this initially
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const broadcast = useMutation({
      mutationFn: async () => {
        invariant(multisigSigner, "Expected multisig signer to exist.");
        const signedTransaction = multisigSigner.createSignedTransaction();
        return await Sdk.chainId(
          multisigKey.chainId
        ).transactions.broadcastSignedTransactionAndLendFees({
          signedTransaction,
          sender: multisigKey.address,
        });
      },
    });

    if (!multisigKey.threshold || !usableSigners.data) return null;

    const keys: Key[] = usableSigners.data.map(({ key, signer }) => {
      const alreadySigned = multisigSigner?.alreadySigned(key.publicKey);
      const onPress = async () => {
        if (multisigSigner?.alreadySigned(key.publicKey)) return;
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
        numberOfSignatures={multisigSigner?.numberOfSignatures || 0}
        numberOfUsableKeys={usableSigners.data.length}
        innerMessages={payload.messages}
        data={keys}
        safeSpendLimitExceeded={safeSpendLimitExceeded}
        onCancel={() => {
          interaction.resolve({ approved: false });
        }}
        onConfirm={async () => {
          const response = await broadcast.mutateAsync();
          interaction.resolve({ approved: true, payload: response });
        }}
      />
    );
  });

function useMultisigSigner() {
  const multisigSignerRef = useRef<MultisigSigner>();
  const [_, setOrderedSignatures] = useState<unknown[]>([]);

  return {
    multisigSigner: multisigSignerRef.current,
    setMultisigSigner: (signer: MultisigSigner) => {
      multisigSignerRef.current = signer;
      setOrderedSignatures(signer.orderedSignatures);
    },
    addSigner: async (signer: Signer) => {
      await multisigSignerRef.current?.addSigner(signer);
      setOrderedSignatures(multisigSignerRef.current?.orderedSignatures ?? []);
    },
  };
}
