import {
  createLcdClient,
  isTerraChain,
  KeyType,
  lendFees,
  MultisigKey,
  RequestObiTerraSignAndBroadcastPayload,
  terra,
} from "@obi-wallet/common";
import {
  BlockTxBroadcastResult,
  isTxError,
  Msg,
  SignatureV2,
  Tx,
} from "@terra-money/terra.js";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import invariant from "tiny-invariant";

import {
  BiometricsKey,
  PhoneNumberConfirmKey,
  PhoneNumberRequestKey,
} from "./keys";
import { existsKeyOnDevice } from "../../../biometrics";
import {
  BottomSheet,
  BottomSheetRef,
} from "../../../screens/components/bottom-sheet";
import { CheckIcon, Key } from "../../../screens/components/keys-list";
import { useStore } from "../../../stores";
import {
  MultisigConfirmMessages,
  MultisigConfirmMessagesProps,
} from "../multisig-confirm-messages";
import { PhoneNumberBottomSheetContent } from "../phone-number-bottom-sheet-content";

export interface TerraSignatureModalProps
  extends Omit<
    MultisigConfirmMessagesProps,
    | "numberOfSignatures"
    | "threshold"
    | "data"
    | "innerMessages"
    | "onConfirm"
    | "footer"
  > {
  multisigKey: MultisigKey;
  innerMessages: Msg[];
  messages: Msg[];
  hiddenKeyTypes?: KeyType[];
  demoMode: boolean;

  onConfirm(transaction: Tx): void;
}

export const TerraSignatureModal = observer<TerraSignatureModalProps>(
  function TerraSignatureModal({
    multisigKey,
    innerMessages,
    messages,
    onConfirm,
    hiddenKeyTypes,
    demoMode,
    ...props
  }: TerraSignatureModalProps) {
    const [signatures, setSignatures] = useState(
      new Map<string, SignatureV2>()
    );
    const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
    const { chainStore } = useStore();
    const chainId = chainStore.currentChain;

    invariant(isTerraChain(chainId), "Expected Terra chain.");

    const numberOfSignatures = signatures.size;
    const threshold = multisigKey.threshold;

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

    useEffect(() => {
      (async () => {
        for (let i = 0; i < 10; i++) {
          try {
            waitForTxInfo.current = (async () => {
              const key = terra.createMultisigPublicKey({ multisigKey });
              transactionInformation.current =
                await terra.createMultisigTransaction({
                  key,
                  messages,
                  chainId,
                });
            })();
            await waitForTxInfo.current;
            break;
          } catch (e) {
            const error = e as Error;
            if (i === 9) {
              Alert.alert("Something went wrong", error.message, [
                {
                  text: "Cancel Transaction",
                  style: "cancel",
                  onPress: () => {
                    props.onCancel();
                  },
                },
              ]);
            }
          }
        }
      })();
    }, [multisigKey, chainId, messages, props]);

    function getKey({ type }: { type: KeyType }): Key {
      const factor = multisigKey.getKeyOfType(type);
      invariant(factor, "Expected key to exist.");

      const alreadySigned = signatures.has(factor.payload.publicKey.value);
      const onPress = async () => {
        if (alreadySigned) return;

        const { signDoc } = await getTransactionInformation();

        switch (type) {
          case KeyType.Device: {
            const biometricsKey = new BiometricsKey({
              multisigKey,
            });

            const signature = await biometricsKey.createSignatureAmino(signDoc);

            setSignatures((signatures) => {
              return new Map(
                signatures.set(factor.payload.publicKey.value, signature)
              );
            });
            break;
          }
          case KeyType.Phone:
            phoneNumberBottomSheetRef.current?.snapToIndex(0);
            break;
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

        const deviceKey = multisigKey.getKeyOfType(KeyType.Device);
        const phoneKey = multisigKey.getKeyOfType(KeyType.Phone);

        if (
          deviceKey &&
          (await existsKeyOnDevice({
            publicKey: deviceKey.payload.publicKey.value,
          }))
        ) {
          usableKeys.push(KeyType.Device);
        }

        if (phoneKey) {
          usableKeys.push(KeyType.Phone);
        }

        setUsableKeys(usableKeys);
      })();
    }, [multisigKey]);

    if (!threshold || !usableKeys) return null;

    const phoneKey = multisigKey.getKeyOfType(KeyType.Phone);

    const data: Key[] = [
      getKey({
        type: KeyType.Device,
      }),
      getKey({
        type: KeyType.Phone,
      }),
    ].filter((key) => {
      return (
        usableKeys.includes(key.type as KeyType) &&
        !(hiddenKeyTypes || []).includes(key.type as KeyType)
      );
    });

    return (
      <MultisigConfirmMessages
        key={JSON.stringify(messages)}
        {...props}
        threshold={multisigKey.threshold}
        numberOfSignatures={numberOfSignatures}
        data={data}
        innerMessages={innerMessages.map((message) => message.toAmino())}
        onConfirm={async () => {
          const { sign } = await getTransactionInformation();
          const signaturesOrdered: SignatureV2[] = [];
          for (const key of multisigKey.keys) {
            const signature = signatures.get(key.payload.publicKey.value);
            if (signature) {
              signaturesOrdered.push(signature);
            }
          }

          console.log(signaturesOrdered);

          await onConfirm(await sign(signaturesOrdered));
        }}
        footer={
          phoneKey ? (
            <BottomSheet bottomSheetRef={phoneNumberBottomSheetRef}>
              <PhoneNumberBottomSheetContent
                securityQuestion={phoneKey.payload.securityQuestion}
                onRequest={async (securityAnswer) => {
                  const { signDoc } = await getTransactionInformation();
                  const phoneNumberRequestKey = new PhoneNumberRequestKey({
                    securityAnswer,
                    chainId,
                    multisigKey,
                    demoMode,
                  });
                  await phoneNumberRequestKey.createSignatureAmino(signDoc);
                }}
                onConfirm={async (key) => {
                  const { signDoc } = await getTransactionInformation();
                  const phoneNumberRequestKey = new PhoneNumberConfirmKey({
                    key,
                    multisigKey,
                    demoMode,
                  });
                  const signature =
                    await phoneNumberRequestKey.createSignatureAmino(signDoc);
                  if (signature) {
                    setSignatures((signatures) => {
                      return new Map(
                        signatures.set(
                          phoneKey.payload.publicKey.value,
                          signature
                        )
                      );
                    });
                    phoneNumberBottomSheetRef.current?.close();
                  }
                }}
              />
            </BottomSheet>
          ) : null
        }
      />
    );
  }
);

export function useTerraSignatureModalProps({
  data,
  onConfirm,
}: {
  data: RequestObiTerraSignAndBroadcastPayload;
  onConfirm(response: BlockTxBroadcastResult): Promise<void>;
}): {
  signatureModalProps: TerraSignatureModalProps;
  openSignatureModal: () => void;
} {
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const { chainStore } = useStore();
  const chainId = chainStore.currentChain;
  invariant(isTerraChain(chainId), "Expected terra chain.");

  const multisigKey = MultisigKey.deserialize({
    chain: chainStore.currentChain,
    serialized: data.multisigKey,
  });
  const sender = multisigKey.address;

  const rawMessages = data.messages.map((data) => {
    return Msg.fromAmino(data);
  });
  const messages = getWrappedMessages();

  console.log(JSON.stringify(messages[0].toAmino(), null, 2));

  const innerMessages = rawMessages;

  const signatureModalProps = useMemo((): TerraSignatureModalProps & {
    key: string;
  } => {
    return {
      key: modalKey.toString(),
      multisigKey,
      demoMode: data.demoMode,
      visible: signatureModalVisible,
      innerMessages,
      messages,
      cancelable: data.cancelable,
      hiddenKeyTypes: data.hiddenKeyTypes,
      isOnboarding: data.isOnboarding,
      onCancel() {
        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },
      async onConfirm(transaction: Tx) {
        const client = await createLcdClient(chainId);

        // TODO: handle fees estimation similar to station Tx.tsx
        try {
          let response = await client.tx.broadcastBlock(transaction);
          if (isTxError(response)) {
            if (response.raw_log.includes("insufficient funds")) {
              await lendFees({
                chainId,
                address: sender,
              });
              response = await client.tx.broadcastBlock(transaction);
            }
          }
          await onConfirm(response);
        } catch (e) {
          console.log(e);
        }

        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },
    };
  }, [
    modalKey,
    multisigKey,
    data,
    signatureModalVisible,
    innerMessages,
    messages,
    onConfirm,
    chainId,
    sender,
  ]);

  return {
    signatureModalProps,
    openSignatureModal() {
      setSignatureModalVisible(true);
    },
  };

  function getWrappedMessages(): Msg[] {
    if (!data.proxyAddress) return rawMessages;

    return terra.wrapMessages({
      messages: rawMessages,
      sender,
      contract: data.proxyAddress,
    });
  }
}
