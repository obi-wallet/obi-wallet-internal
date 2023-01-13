import {
  createLcdClient,
  isAnyMultisigWallet,
  MultisigKey,
  RequestObiTerraSignAndBroadcastPayload,
  TerraMultisig,
  TerraMultisigKey,
  TerraMultisigWallet,
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
import { useIntl } from "react-intl";
import invariant from "tiny-invariant";

import { lendFees } from "../../../fee-lender-worker";
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
import { useGasPrices } from "./hooks";
import {
  BiometricsKey,
  PhoneNumberConfirmKey,
  PhoneNumberRequestKey,
} from "./keys";
import { wrapMessages } from "./wrap-messages";

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
  wallet: TerraMultisigWallet;
  innerMessages: Msg[];
  messages: Msg[];
  multisig: TerraMultisig;
  hiddenKeyIds?: TerraMultisigKey[];
  onConfirm(transaction: Tx): void;
}

export const TerraSignatureModal = observer<TerraSignatureModalProps>(
  function TerraSignatureModal({
    wallet,
    innerMessages,
    messages,
    multisig,
    onConfirm,
    hiddenKeyIds,
    ...props
  }: TerraSignatureModalProps) {
    const intl = useIntl();
    const [signatures, setSignatures] = useState(
      new Map<TerraMultisigKey, SignatureV2>()
    );
    const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
    const { chainStore } = useStore();
    const { currentTerraChainInformation } = chainStore;
    const numberOfSignatures = signatures.size;
    const threshold = multisig?.multisig?.publicKey.value.threshold;

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

    if (!threshold || !gasPrices) return null;

    return (
      <MultisigConfirmMessages
        {...props}
        threshold={parseInt(threshold, 10)}
        numberOfSignatures={numberOfSignatures}
        data={data}
        innerMessages={innerMessages.map((message) => message.toAmino())}
        onConfirm={async () => {
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
