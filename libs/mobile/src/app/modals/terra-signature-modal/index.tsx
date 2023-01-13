import {
  createLcdClient,
  isAnyMultisigWallet,
  MultisigKey,
  RequestObiTerraSignAndBroadcastPayload,
  TerraMultisig,
  TerraMultisigKey,
  TerraMultisigWallet,
  Text,
} from "@obi-wallet/common";
import {
  BlockTxBroadcastResult,
  LegacyAminoMultisigPublicKey,
  Msg,
  MultiSignature,
  SignatureV2,
  SignDoc,
  Tx,
} from "@terra-money/terra.js";
import { AxiosError } from "axios";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, ModalProps, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import invariant from "tiny-invariant";

import { lendFees } from "../../fee-lender-worker";
import { Loader } from "../../loader";
import {
  BottomSheet,
  BottomSheetRef,
} from "../../screens/components/bottom-sheet";
import { CheckIcon, Key, KeysList } from "../../screens/components/keys-list";
import { useStore } from "../../stores";
import { ConfirmMessages } from "../signature-modal/confirm-messages";
import { PhoneNumberBottomSheetContent } from "../signature-modal/phone-number-bottom-sheet-content";
import { useGasPrices } from "./hooks";
import {
  BiometricsKey,
  PhoneNumberConfirmKey,
  PhoneNumberRequestKey,
} from "./keys";
import { wrapMessages } from "./wrap-messages";

export interface TerraSignatureModalProps extends ModalProps {
  wallet: TerraMultisigWallet;
  innerMessages: Msg[];
  messages: Msg[];
  multisig: TerraMultisig;
  cancelable?: boolean;
  hiddenKeyIds?: TerraMultisigKey[];
  isOnboarding?: boolean;

  onCancel(): void;

  onConfirm(transaction: Tx): void;
}

export const TerraSignatureModal = observer<TerraSignatureModalProps>(
  function SignatureModal({
    wallet,
    messages,
    multisig,
    onCancel,
    onConfirm,
    hiddenKeyIds,
    isOnboarding,
    ...props
  }: TerraSignatureModalProps) {
    const intl = useIntl();
    const [signatures, setSignatures] = useState(
      new Map<TerraMultisigKey, SignatureV2>()
    );
    const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
    const { chainStore, configStore } = useStore();
    const { currentTerraChainInformation } = chainStore;
    const [settingBiometrics, setSettingBiometrics] = useState(false);
    const isObi = configStore.isObi();
    const isLoop = configStore.isLoop();
    const numberOfSignatures = signatures.size;
    const threshold = multisig?.multisig?.publicKey.value.threshold;
    const enoughSignatures = threshold
      ? numberOfSignatures >= parseInt(threshold, 10)
      : false;

    const waitForTxInfo = useRef<Promise<void>>();
    const transactionInformation = useRef<{
      accountSequenceNumber: number;
      transaction: Tx;
      signDoc: SignDoc;
    } | null>();

    const { data: gasPrices } = useGasPrices();

    async function getTransactionInformation() {
      while (!transactionInformation.current) {
        await waitForTxInfo.current;
      }
      return transactionInformation.current;
    }

    useEffect(() => {
      waitForTxInfo.current = (async () => {
        transactionInformation.current = null;
        const address = multisig.multisig?.address;
        invariant(address, "Expected `address` to exist.");

        const client = await createLcdClient(
          currentTerraChainInformation.chainId
        );

        try {
          await client.auth.accountInfo(address);
        } catch (e) {
          await lendFees({
            chainId: currentTerraChainInformation.chainId,
            address,
          });
        }
        const account = await client.auth.accountInfo(address);

        try {
          console.log(gasPrices);
          const transaction = await client.tx.create(
            [
              {
                address,
                sequenceNumber: account.getSequenceNumber(),
                publicKey: account.getPublicKey(),
              },
            ],
            {
              msgs: messages,
              gasPrices,
              gasAdjustment: 2,
            }
          );

          const signDoc = new SignDoc(
            currentTerraChainInformation.chainId,
            account.getAccountNumber(),
            account.getSequenceNumber(),
            transaction.auth_info,
            transaction.body
          );
          transactionInformation.current = {
            accountSequenceNumber: account.getSequenceNumber(),
            transaction,
            signDoc,
          };
        } catch (e) {
          const error = e as AxiosError;
          console.log("Could not create transaction", error.response?.data);
        }
      })();
    }, [
      gasPrices,
      multisig.multisig?.address,
      currentTerraChainInformation.chainId,
      messages,
    ]);

    function getKey({ id, title }: { id: MultisigKey; title: string }): Key[] {
      const factor = multisig?.[id];
      if (!factor) return [];

      const alreadySigned = signatures.has(id);
      const onPress = async () => {
        if (alreadySigned) return;

        const { signDoc } = await getTransactionInformation();

        switch (id) {
          case "biometrics": {
            const biometricsKey = new BiometricsKey({
              wallet,
              multisig,
            });
            const signature = await biometricsKey.createSignatureAmino(signDoc);

            setSignatures((signatures) => {
              return new Map(signatures.set(id, signature));
            });
            break;
          }
          case "phoneNumber":
            phoneNumberBottomSheetRef.current?.snapToIndex(0);
            break;
          case "cloud":
            console.log("Not implemented yet");
            break;
        }
      };

      return [
        {
          id,
          title,
          signed: alreadySigned,
          right: alreadySigned ? <CheckIcon /> : null,
          onPress,
        },
      ];
    }

    const data: Key[] = [
      ...getKey({
        id: "biometrics",
        title: intl.formatMessage({
          id: "signature.modal.biometricsignature",
          defaultMessage: "Biometrics Signature",
        }),
      }),
      ...getKey({
        id: "phoneNumber",
        title: intl.formatMessage({
          id: "signature.modal.phonesignature",
          defaultMessage: "Phone Number Signature",
        }),
      }),
    ].filter((key) => {
      return hiddenKeyIds ? !hiddenKeyIds.includes(key.id) : true;
    });
    const [loading, setLoading] = useState(false);

    const didAutosign = useRef(false);
    useEffect(() => {
      (async () => {
        if (props.visible && !didAutosign.current) {
          didAutosign.current = true;
          const biometrics = data.find((key) => key.id === "biometrics");
          if (biometrics && typeof biometrics.onPress === "function") {
            try {
              setSettingBiometrics(true);
              await biometrics.onPress();
            } catch (e) {
              // noop
            }
            setSettingBiometrics(false);
          }
        }
      })();
      // We really only want to do this once
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.visible]);

    if (!threshold || !gasPrices) return null;

    const getSignaturePercentage = () => {
      const percentage = (numberOfSignatures / parseInt(threshold, 10)) * 100;
      if (percentage > 100) return "100%";
      return `${percentage}%`;
    };
    return (
      <ConfirmMessages
        {...props}
        loading={loading}
        isOnboarding={isOnboarding}
        disabled={!enoughSignatures}
        messages={props.innerMessages.map((message) => message.toAmino())}
        onCancel={onCancel}
        onConfirm={async () => {
          console.log(signatures);

          try {
            setLoading(true);
            const { accountSequenceNumber, transaction } =
              await getTransactionInformation();
            const signaturesOrdered = [];
            for (const key of wallet.getSignerTypes(multisig)) {
              const signature = signatures.get(key);
              if (signature) {
                signaturesOrdered.push(signature);
              }
            }

            invariant(multisig.multisig, "Expected multisig to exist.");
            const multisigPubkey = LegacyAminoMultisigPublicKey.fromAmino(
              multisig.multisig.publicKey
            );
            const multiSignature = new MultiSignature(multisigPubkey);
            multiSignature.appendSignatureV2s(signaturesOrdered);
            transaction.appendSignatures([
              new SignatureV2(
                multisigPubkey,
                multiSignature.toSignatureDescriptor(),
                accountSequenceNumber
              ),
            ]);
            await onConfirm(transaction);
            setLoading(false);
          } catch (e) {
            const error = e as Error;
            setLoading(false);
            console.error(error);
            Alert.alert("Error confirming signature", error.message);
          }
        }}
        footer={
          multisig?.phoneNumber ? (
            <BottomSheet bottomSheetRef={phoneNumberBottomSheetRef}>
              <PhoneNumberBottomSheetContent
                securityQuestion={multisig.phoneNumber.securityQuestion}
                onRequest={async (securityAnswer) => {
                  invariant(
                    multisig.phoneNumber,
                    "Expected phoneNumber key to exist"
                  );

                  const { signDoc } = await getTransactionInformation();
                  const phoneNumberRequestKey = new PhoneNumberRequestKey({
                    phoneNumber: multisig.phoneNumber.phoneNumber,
                    securityAnswer,
                    chainId: currentTerraChainInformation.chainId,
                    wallet,
                    multisig,
                  });
                  await phoneNumberRequestKey.createSignatureAmino(signDoc);
                }}
                onConfirm={async (key) => {
                  const { signDoc } = await getTransactionInformation();
                  const phoneNumberRequestKey = new PhoneNumberConfirmKey({
                    key,
                    wallet,
                    multisig,
                  });
                  const signature =
                    await phoneNumberRequestKey.createSignatureAmino(signDoc);
                  if (signature) {
                    setSignatures((signatures) => {
                      const { phoneNumber } = multisig;
                      invariant(
                        phoneNumber,
                        "Expected phone number key to exist."
                      );
                      return new Map(signatures.set("phoneNumber", signature));
                    });
                    phoneNumberBottomSheetRef.current?.close();
                  }
                }}
              />
            </BottomSheet>
          ) : null
        }
      >
        {isLoop && (
          <View
            style={{
              height: 10,
              backgroundColor: "#1E1D3A",
              borderRadius: 10,
            }}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["#FCCFF7", "#E659D6", "#8877EA", "#86E2EE"]}
              style={{
                flex: 1,
                width: getSignaturePercentage(),
                borderRadius: 10,
              }}
            />
          </View>
        )}
        {isLoop && (
          <View>
            <Text
              style={{
                textAlign: "center",
                color: "#F6F5FF",
                fontSize: 12,
                fontWeight: "600",
                opacity: 0.6,
                marginTop: 5,
              }}
            >
              <FormattedMessage
                id="signature.keysrequired"
                defaultMessage="Keys Required"
              />
              : {numberOfSignatures}/{threshold}{" "}
            </Text>
          </View>
        )}
        {settingBiometrics ? (
          <View
            style={{
              marginVertical: 10,
              backgroundColor: isLoop ? "#130F23" : "",
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 50,
            }}
          >
            <Loader
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              loadingText={intl.formatMessage({
                id: "onboarding6.loadingtext",
                defaultMessage: "Preparing Wallet...",
              })}
            />
          </View>
        ) : (
          <KeysList
            data={data}
            tiled
            style={{
              marginVertical: 10,
              backgroundColor: isObi ? "transparent" : "#130F23",
              borderRadius: 12,
            }}
          />
        )}
        {isObi && (
          <View>
            <Text
              style={{
                textAlign: "center",
                color: "#F6F5FF",
                fontSize: 12,
                fontWeight: "600",
                opacity: 0.6,
                marginTop: 5,
              }}
            >
              <FormattedMessage
                id="signature.keysrequired"
                defaultMessage="Keys Required"
              />
              : {numberOfSignatures}/{threshold}{" "}
            </Text>
          </View>
        )}
      </ConfirmMessages>
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
  const { chainStore, walletsStore } = useStore();
  const { currentTerraChainInformation } = chainStore;

  const { id, multisig } = data;
  const wallet = walletsStore.getWallet(id) as TerraMultisigWallet;

  const rawMessages = data.messages.map((data) => {
    return Msg.fromAmino(data);
  });
  const messages = getWrappedMessages();

  console.log(JSON.stringify(messages[0].toAmino()), null, 2);

  const innerMessages = rawMessages;

  const signatureModalProps = useMemo(() => {
    return {
      key: modalKey.toString(),
      wallet,
      visible: signatureModalVisible,
      innerMessages,
      messages,
      multisig,
      cancelable: data.cancelable,
      hiddenKeyIds: data.hiddenKeyIds,
      isOnboarding: data.isOnboarding,
      onCancel() {
        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },
      async onConfirm(transaction: Tx) {
        const client = await createLcdClient(
          currentTerraChainInformation.chainId
        );

        const address = multisig.multisig?.address;
        invariant(address, "Expected multisig address to exist.");

        // TODO: handle fees estimation similar to station Tx.tsx
        try {
          const response = await client.tx.broadcastBlock(transaction);
          await onConfirm(response);
        } catch (e) {
          console.log(e);
        }

        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },
    };
  }, [
    innerMessages,
    messages,
    modalKey,
    wallet,
    signatureModalVisible,
    multisig,
    data,
    currentTerraChainInformation,
    onConfirm,
  ]);

  return {
    signatureModalProps,
    openSignatureModal() {
      setSignatureModalVisible(true);
    },
  };

  function getWrappedMessages(): Msg[] {
    if (!isAnyMultisigWallet(wallet) || !data.wrap) return rawMessages;

    const multisig = data.multisig;
    if (!multisig?.multisig?.address || !wallet.proxyAddress) {
      return [];
    }
    return wrapMessages({
      messages: rawMessages,
      sender: multisig.multisig.address,
      contract: wallet.proxyAddress.address,
    });
  }
}
