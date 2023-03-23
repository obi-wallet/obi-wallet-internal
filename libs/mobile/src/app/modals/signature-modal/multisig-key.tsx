import { terra } from "@obi-wallet/common";
import {
  Chain,
  isTerraChain,
  KeyType,
  MultisigKey,
  Sdk,
  TerraChain,
} from "@obi-wallet/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isTxError, SignatureV2 } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import NfcManager, { NfcEvents, OnDiscoverTag } from "react-native-nfc-manager";
import invariant from "tiny-invariant";

import {
  AbstractSignatureModalProps,
  broadcastTransaction,
  wrapMessages,
} from "./common";
import { MultisigConfirmMessages } from "./multisig-confirm-messages";
import { PhoneNumberBottomSheetContent } from "./phone-number-bottom-sheet-content";
import {
  BiometricsKey,
  CloudKey,
  NfcKey,
  PhoneNumberConfirmKey,
  PhoneNumberRequestKey,
} from "./terra/keys";
import { existsKeyOnDevice } from "../../biometrics";
import { checkIsSupported, parseNFCData, startReading } from "../../nfc";
import {
  BottomSheet,
  BottomSheetRef,
} from "../../screens/components/bottom-sheet";
import { CheckIcon, Key } from "../../screens/components/keys-list";

export interface SignatureModalMultisigKeyProps
  extends AbstractSignatureModalProps {
  chainId: Chain;
  multisigKey: MultisigKey;
  proxyAddress?: string;
  safeSpendLimitExceeded?: boolean;
}

export const SignatureModalMultisigKey =
  observer<SignatureModalMultisigKeyProps>(function SignatureModalMultisigKey({
    chainId,
    interaction,
    multisigKey,
    proxyAddress,
    safeSpendLimitExceeded,
  }) {
    const { payload } = interaction;
    const [signatures, setSignatures] = useState(
      new Map<string, SignatureV2>()
    );
    const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
    const queryClient = useQueryClient();

    const sender = multisigKey.address;

    const innerMessages = payload.messages;

    const messages = wrapMessages({
      messages: innerMessages,
      proxyAddress,
      sender,
    });

    const waitForTxInfo = useRef<Promise<void>>();
    const transactionInformation = useRef<Awaited<
      ReturnType<typeof terra.createMultisigTransaction>
    > | null>();
    async function getTransactionInformation() {
      while (!transactionInformation.current) {
        await waitForTxInfo.current;
      }
      return transactionInformation.current;
    }

    const transaction = useMutation({
      mutationFn: async () => {
        // TODO: use new abstractions
        invariant(isTerraChain(chainId), "Expected Terra chain.");
        const key = terra.createMultisigPublicKey({ multisigKey });
        return await terra.createMultisigTransaction({
          key,
          messages,
          chainId,
        });
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

    const broadcast = useMutation({
      mutationFn: async () => {
        const { sign } = await getTransactionInformation();
        const signaturesOrdered: SignatureV2[] = [];
        for (const key of multisigKey.keys) {
          const signature = signatures.get(key.publicKey.value);
          if (signature) {
            signaturesOrdered.push(signature);
          }
        }

        const transaction = await sign(signaturesOrdered);
        return await broadcastTransaction({
          chainId,
          interaction,
          transaction,
          sender: multisigKey.address,
        });
      },
    });

    useEffect(() => {
      waitForTxInfo.current = (async () => {
        transactionInformation.current = await transaction.mutateAsync();
      })();
      // TODO:
    }, []);

    function getKey({ type }: { type: KeyType }): Key {
      const factor = multisigKey.getUsableKeyOfType(type);
      invariant(factor, "Expected key to exist.");

      const alreadySigned = signatures.has(factor.publicKey.value);
      const onPress = async () => {
        if (alreadySigned) return;

        const { signDoc } = await getTransactionInformation();

        switch (type) {
          case KeyType.Device: {
            const biometricsKey = new BiometricsKey({
              multisigKey,
              queryClient,
            });

            const signature = await biometricsKey.createSignatureAmino(signDoc);

            setSignatures((signatures) => {
              return new Map(signatures.set(factor.publicKey.value, signature));
            });
            break;
          }
          case KeyType.Phone:
            phoneNumberBottomSheetRef.current?.snapToIndex(0);
            break;
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

                const nfcKey = new NfcKey({
                  multisigKey,
                  parsed,
                  demoMode: payload.demoMode,
                  queryClient,
                });

                const signature = await nfcKey.createSignatureAmino(signDoc);

                setSignatures((signatures) => {
                  return new Map(
                    signatures.set(factor.publicKey.value, signature)
                  );
                });
              }
            };

            NfcManager.setEventListener(NfcEvents.DiscoverTag, onDiscoverTag);
            await startReading("Tap your NFC device to sign this transaction.");
            break;
          }
          case KeyType.Cloud: {
            const cloudKey = new CloudKey({ multisigKey });

            const signature = await cloudKey.createSignatureAmino(signDoc);

            setSignatures((signatures) => {
              return new Map(signatures.set(factor.publicKey.value, signature));
            });
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
                  const { signDoc } = await getTransactionInformation();
                  const phoneNumberRequestKey = new PhoneNumberRequestKey({
                    securityAnswer,
                    // TODO:
                    chainId: chainId as TerraChain,
                    multisigKey,
                    demoMode: payload.demoMode,
                  });
                  await phoneNumberRequestKey.createSignatureAmino(signDoc);
                }}
                onConfirm={async (key) => {
                  const { signDoc } = await getTransactionInformation();
                  const phoneNumberRequestKey = new PhoneNumberConfirmKey({
                    key,
                    multisigKey,
                    demoMode: payload.demoMode,
                    queryClient,
                  });
                  const signature =
                    await phoneNumberRequestKey.createSignatureAmino(signDoc);
                  if (signature) {
                    setSignatures((signatures) => {
                      return new Map(
                        signatures.set(phoneKey.publicKey.value, signature)
                      );
                    });
                    phoneNumberBottomSheetRef.current?.close();
                  }
                }}
              />
            </BottomSheet>
          ) : null
        }
        threshold={multisigKey.threshold}
        numberOfSignatures={signatures.size}
        numberOfUsableKeys={usableKeys.length}
        innerMessages={payload.messages}
        data={keys}
        safeSpendLimitExceeded={safeSpendLimitExceeded}
        onCancel={() => {
          interaction.resolve({ approved: false });
        }}
        onConfirm={async () => {
          // TODO: use new abstractions
          const rawResult = await broadcast.mutateAsync();
          const response = {
            success: !isTxError(rawResult),
            transactionHash: rawResult.txhash,
            rawLog: rawResult.raw_log,
            rawResult,
          };
          interaction.resolve({ approved: true, payload: response });
        }}
      />
    );
  });
