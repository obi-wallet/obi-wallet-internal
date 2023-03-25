import {
  KeySubclassTypeMapping,
  KeyType,
  MultisigKey,
  MultisigSigner,
  PhoneKeySigner,
  Sdk,
  Signer,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import NfcManager, { NfcEvents, OnDiscoverTag } from "react-native-nfc-manager";
import invariant from "tiny-invariant";

import { AbstractSignatureModalProps, wrapMessages } from "./common";
import { MultisigConfirmMessages } from "./multisig-confirm-messages";
import { PhoneNumberBottomSheetContent } from "./phone-number-bottom-sheet-content";
import {
  createCloudKeySigner,
  createDeviceKeySigner,
  createNfcKeySigner,
} from "./signers";
import { existsKeyOnDevice } from "../../biometrics";
import { checkIsSupported, parseNFCData, startReading } from "../../nfc";
import {
  BottomSheet,
  BottomSheetRef,
} from "../../screens/components/bottom-sheet";
import { CheckIcon, Key } from "../../screens/components/keys-list";
import { getTwilioClient } from "../../text-message";

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
    const [phoneKeySigner, setPhoneKeySigner] = useState<PhoneKeySigner | null>(
      null
    );

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
          multisigKey.chain
        ).broadcastSignedTransactionAndLendFees({
          signedTransaction,
          sender: multisigKey.address,
        });
      },
    });

    function getKey({ type }: { type: KeyType }): Key {
      const factor = multisigKey.getUsableKeyOfType(type);
      invariant(factor, "Expected key to exist.");

      const alreadySigned = multisigSigner?.alreadySigned(factor.publicKey);
      const onPress = async () => {
        if (alreadySigned) return;

        switch (type) {
          case KeyType.Device: {
            const signer = await createDeviceKeySigner({ multisigKey });
            await addSigner(signer);
            break;
          }
          case KeyType.Phone: {
            const signer = new PhoneKeySigner(
              multisigKey.chain,
              factor as KeySubclassTypeMapping[KeyType.Phone],
              getTwilioClient(payload.demoMode)
            );
            setPhoneKeySigner(signer);
            phoneNumberBottomSheetRef.current?.snapToIndex(0);
            await addSigner(signer);
            break;
          }
          case KeyType.Nfc: {
            const onDiscoverTag: OnDiscoverTag = async (tag) => {
              if (tag.ndefMessage && tag.ndefMessage.length > 0) {
                const parsed = parseNFCData(tag);

                console.warn(
                  `Associated NFC address is ${Sdk.chainId(
                    multisigKey.chain
                  ).getAddressOfPublicKey({
                    publicKey: factor.publicKey,
                  })}`
                );

                const signer = await createNfcKeySigner({
                  multisigKey,
                  demoMode: payload.demoMode,
                  parsed,
                });
                await addSigner(signer);
              }
            };

            NfcManager.setEventListener(NfcEvents.DiscoverTag, onDiscoverTag);
            await startReading("Tap your NFC device to sign this transaction.");
            break;
          }
          case KeyType.Cloud: {
            const signer = await createCloudKeySigner({ multisigKey });
            await addSigner(signer);
            break;
          }
          default:
            console.log("Not implemented yet");
            break;
        }
      };

      return {
        type,
        signed: alreadySigned,
        right: alreadySigned ? <CheckIcon /> : null,
        onPress,
      };
    }

    const [usableKeys, setUsableKeys] = useState<KeyType[] | null>(null);
    useEffect(() => {
      (async () => {
        const usableKeys = [];

        const deviceKey = multisigKey.getUsableKeyOfType(KeyType.Device);
        const phoneKey = multisigKey.getUsableKeyOfType(KeyType.Phone);
        const nfcKey = multisigKey.getUsableKeyOfType(KeyType.Nfc);
        const cloudKey = multisigKey.getUsableKeyOfType(KeyType.Cloud);

        if (
          deviceKey &&
          (await existsKeyOnDevice({
            publicKey: deviceKey.publicKey.value,
          }))
        ) {
          usableKeys.push(KeyType.Device);
        }

        if (phoneKey) {
          usableKeys.push(KeyType.Phone);
        }

        if (nfcKey && (await checkIsSupported())) {
          usableKeys.push(KeyType.Nfc);
        }

        if (cloudKey) {
          usableKeys.push(KeyType.Cloud);
        }

        setUsableKeys(usableKeys);
      })();
    }, [multisigKey]);

    if (!multisigKey.threshold || !usableKeys) return null;

    const phoneKey = multisigKey.getUsableKeyOfType(KeyType.Phone);

    const keys: Key[] = usableKeys.map((type) => {
      return getKey({ type });
    });

    return (
      <MultisigConfirmMessages
        footer={
          phoneKey ? (
            <BottomSheet bottomSheetRef={phoneNumberBottomSheetRef}>
              <PhoneNumberBottomSheetContent
                phoneNumber={phoneKey.payload.phoneNumber}
                securityQuestion={phoneKey.payload.securityQuestion}
                onRequest={async (securityAnswer) => {
                  invariant(
                    phoneKeySigner,
                    "Expected phone key signer to exist."
                  );
                  await phoneKeySigner.requestSignature(securityAnswer);
                }}
                onConfirm={async (key) => {
                  invariant(
                    phoneKeySigner,
                    "Expected phone key signer to exist."
                  );
                  await phoneKeySigner.confirmSignature(key);
                  phoneNumberBottomSheetRef.current?.close();
                }}
              />
            </BottomSheet>
          ) : null
        }
        threshold={multisigKey.threshold}
        numberOfSignatures={signer.data?.numberOfSignatures || 0}
        numberOfUsableKeys={usableKeys.length}
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
