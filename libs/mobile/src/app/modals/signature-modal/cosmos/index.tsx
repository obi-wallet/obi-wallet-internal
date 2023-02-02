import { AminoMsg, coins, serializeSignDoc, StdSignDoc } from "@cosmjs/amino";
import { createWasmAminoConverters } from "@cosmjs/cosmwasm-stargate";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate/build/modules";
import { Sha256 } from "@cosmjs/crypto/build/sha";
import {
  EncodeObject,
  Registry,
  TxBodyEncodeObject,
} from "@cosmjs/proto-signing";
import {
  AminoConverters,
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  defaultRegistryTypes,
  DeliverTxResponse,
  makeMultisignedTx,
} from "@cosmjs/stargate";
import { createVestingAminoConverters } from "@cosmjs/stargate/build/modules";
import {
  cosmos,
  cosmosChains,
  createStargateClient,
  isCosmosChain,
  KeyType,
  lendFees,
  MultisigKey,
  RequestObiCosmosSignAndBroadcastPayload,
} from "@obi-wallet/common";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import invariant from "tiny-invariant";

import { wrapMessages } from "./wrap-messages";
import { createBiometricSignature } from "../../../biometrics";
import {
  BottomSheet,
  BottomSheetRef,
} from "../../../screens/components/bottom-sheet";
import { CheckIcon, Key } from "../../../screens/components/keys-list";
import { useStore } from "../../../stores";
import {
  parseSignatureTextMessageResponse,
  sendSignatureTextMessage,
} from "../../../text-message";
import {
  MultisigConfirmMessages,
  MultisigConfirmMessagesProps,
} from "../multisig-confirm-messages";
import { PhoneNumberBottomSheetContent } from "../phone-number-bottom-sheet-content";

export interface CosmosSignatureModalProps
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
  innerMessages: AminoMsg[];
  messages: AminoMsg[];
  hiddenKeyTypes?: KeyType[];
  demoMode: boolean;

  onConfirm(signatures: Map<string, Uint8Array>): void;
}

export const CosmosSignatureModal = observer<CosmosSignatureModalProps>(
  function CosmosSignatureModal(props) {
    return <CosmosSignatureModalMultisig {...props} />;
  }
);

export const CosmosSignatureModalMultisig = observer<CosmosSignatureModalProps>(
  function SignatureModalMultisig({
    multisigKey,
    innerMessages,
    messages,
    onConfirm,
    hiddenKeyTypes,
    demoMode,
    ...props
  }) {
    const intl = useIntl();
    const [signatures, setSignatures] = useState(new Map<string, Uint8Array>());
    const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
    const { chainStore } = useStore();
    const numberOfSignatures = signatures.size;
    const threshold = multisigKey.threshold;

    const chainId = chainStore.currentChain;
    invariant(
      isCosmosChain(chainId),
      "Expected current chain to be cosmos chain."
    );

    const currentChainInformation = cosmosChains[chainId];

    const getMessage = useCallback(async () => {
      const address = multisigKey.address;

      const fee = {
        amount: coins(6000, currentChainInformation.denom),
        gas: "1280000",
      };

      invariant(address, "Expected `address` to exist.");

      const client = await createStargateClient(chainId);

      if (!(await client.getAccount(address))) {
        await lendFees({
          chainId,
          address,
        });
      }

      const account = await client.getAccount(address);
      invariant(account, "Expected `account` to be ready.");

      const signDoc: StdSignDoc = {
        memo: "",
        account_number: account.accountNumber.toString(),
        chain_id: chainId,
        fee: fee,
        msgs: messages,
        sequence: account.sequence.toString(),
      };

      client.disconnect();
      return new Sha256(serializeSignDoc(signDoc)).digest();
    }, [multisigKey.address, currentChainInformation.denom, chainId, messages]);

    function getKey({ type }: { type: KeyType }): Key[] {
      const factor = multisigKey.getKeyOfType(type);
      if (!factor) return [];

      const alreadySigned = signatures.has(factor.payload.publicKey.value);
      const onPress = async () => {
        if (alreadySigned) return;

        switch (type) {
          case KeyType.Device: {
            const message = await getMessage();
            const { signature } = await createBiometricSignature({
              payload: message,
              demoMode,
            });
            const biometrics = multisigKey.getKeyOfType(KeyType.Device);
            invariant(biometrics, "Expected device key to exist.");

            setSignatures((signatures) => {
              return new Map(
                signatures.set(biometrics.payload.publicKey.value, signature)
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

      return [
        {
          type: type,
          signed: alreadySigned,
          right: alreadySigned ? <CheckIcon /> : null,
          onPress,
        },
      ];
    }

    const data: Key[] = [
      ...getKey({
        type: KeyType.Device,
      }),
      ...getKey({
        type: KeyType.Phone,
      }),
    ].filter((key) => {
      return hiddenKeyTypes
        ? !hiddenKeyTypes.includes(key.type as KeyType)
        : true;
    });

    if (!threshold) return null;

    const phoneKey = multisigKey.getKeyOfType(KeyType.Phone);

    return (
      <MultisigConfirmMessages
        {...props}
        threshold={threshold}
        numberOfSignatures={numberOfSignatures}
        data={data}
        innerMessages={innerMessages}
        onConfirm={async () => {
          const signaturesPerAddress = new Map();
          for (const key of multisigKey.keys) {
            const signature = signatures.get(key.payload.publicKey.value);
            if (signature) {
              signaturesPerAddress.set(
                cosmos.getAddress({
                  publicKey: key.payload.publicKey,
                  chainId: chainId,
                }),
                signature
              );
            }
          }

          await onConfirm(signaturesPerAddress);
        }}
        footer={
          phoneKey ? (
            <BottomSheet bottomSheetRef={phoneNumberBottomSheetRef}>
              <PhoneNumberBottomSheetContent
                securityQuestion={phoneKey.payload.securityQuestion}
                onRequest={async (securityAnswer) => {
                  const message = await getMessage();
                  await sendSignatureTextMessage({
                    phoneNumber: phoneKey.payload.phoneNumber,
                    securityAnswer,
                    message,
                    demoMode,
                    chainId,
                  });
                }}
                onConfirm={async (key) => {
                  const signature = await parseSignatureTextMessageResponse({
                    key,
                    demoMode,
                  });
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

function createDefaultTypes(prefix: string): AminoConverters {
  return {
    ...createAuthzAminoConverters(),
    ...createBankAminoConverters(),
    ...createDistributionAminoConverters(),
    ...createGovAminoConverters(),
    ...createStakingAminoConverters(prefix),
    ...createIbcAminoConverters(),
    ...createFeegrantAminoConverters(),
    ...createVestingAminoConverters(),
    ...createWasmAminoConverters(),
  };
}

const aminoTypes = new AminoTypes(createDefaultTypes("juno"));
const registry = new Registry([...defaultRegistryTypes, ...wasmTypes]);

export function useSignatureModalProps({
  data,
  onConfirm,
}: {
  data: RequestObiCosmosSignAndBroadcastPayload;
  onConfirm(response: DeliverTxResponse): Promise<void>;
}): {
  signatureModalProps: CosmosSignatureModalProps;
  openSignatureModal: () => void;
} {
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const { chainStore } = useStore();

  const chainId = chainStore.currentChain;
  invariant(
    isCosmosChain(chainId),
    "Expected current chain to be cosmos chain."
  );
  const currentChainInformation = cosmosChains[chainId];

  const multisigKey = MultisigKey.deserialize({
    chain: chainStore.currentChain,
    serialized: data.multisigKey,
  });

  const wrappedEncodeObjects = getWrappedEncodeObjects();
  const innerEncodeObjects = data.encodeObjects;

  const signatureModalProps = useMemo((): CosmosSignatureModalProps & {
    key: string;
  } => {
    const innerAminoMessages = innerEncodeObjects.map((encodeObject) => {
      return aminoTypes.toAmino(encodeObject);
    });
    const aminoMessages = wrappedEncodeObjects.map((encodeObject) => {
      return aminoTypes.toAmino(encodeObject);
    });
    const messages = aminoMessages.map((message) => {
      return aminoTypes.fromAmino(message);
    });

    return {
      key: modalKey.toString(),
      multisigKey,
      demoMode: data.demoMode,
      visible: signatureModalVisible,
      innerMessages: innerAminoMessages,
      messages: aminoMessages,
      cancelable: data.cancelable,
      hiddenKeyTypes: data.hiddenKeyTypes,
      isOnboarding: data.isOnboarding,
      onCancel() {
        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },
      async onConfirm(signatures: Map<string, Uint8Array>) {
        async function handleMultisig() {
          if (!multisigKey) return;

          const { chainId, denom } = currentChainInformation;
          const client = await createStargateClient(chainId);

          console.log(messages);

          const body: TxBodyEncodeObject = {
            typeUrl: "/cosmos.tx.v1beta1.TxBody",
            value: {
              messages,
              memo: "",
            },
          };
          const bodyBytes = registry.encode(body);

          const multisigPublicKey = cosmos.createMultisigPublicKey({
            multisigKey,
          });
          const address = multisigKey.address;

          const feeAmount = 6000;
          const fee = {
            amount: coins(feeAmount, denom),
            gas: "1280000",
          };

          if (!(await client.getAccount(address))) {
            await lendFees({ chainId, address });
          }

          async function hasEnoughForFees() {
            const balance = await client?.getBalance(address, denom);
            return balance && parseInt(balance.amount, 10) >= feeAmount;
          }

          while (!(await hasEnoughForFees())) {
            await lendFees({ chainId, address });
          }

          const account = await client.getAccount(address);
          invariant(account, "Expected `account` to be ready.");

          const tx = makeMultisignedTx(
            multisigPublicKey,
            account.sequence,
            fee,
            bodyBytes,
            signatures
          );

          const result = await client.broadcastTx(
            Uint8Array.from(TxRaw.encode(tx).finish())
          );

          client.disconnect();
          await onConfirm(result);
        }

        await handleMultisig();
        // TODO: fixme
        // invariant(
        //   isCosmosSinglesigWallet(wallet),
        //   "Expected `wallet` to be singlesig wallet."
        // );
        //
        // invariant(
        //   wallet.privateKey,
        //   "Expected `wallet.privateKey` to exist."
        // );
        //
        // const signer = await Secp256k1Wallet.fromKey(
        //   wallet.privateKey,
        //   currentCosmosChainInformation.prefix
        // );
        // const client = await createSigningCosmWasmClient({
        //   chainId: currentCosmosChainInformation.chainId,
        //   signer,
        // });
        //
        // invariant(wallet.address, "Expected `wallet.address` to exist.");
        //
        // const result = await client.signAndBroadcast(
        //   wallet.address,
        //   messages,
        //   "auto"
        // );
        //
        // client.disconnect();
        // await onConfirm(result);

        setSignatureModalVisible(false);
        setModalKey((value) => value + 1);
      },
    };
  }, [
    innerEncodeObjects,
    wrappedEncodeObjects,
    modalKey,
    multisigKey,
    data.demoMode,
    data.cancelable,
    data.hiddenKeyTypes,
    data.isOnboarding,
    signatureModalVisible,
    currentChainInformation,
    onConfirm,
  ]);

  return {
    signatureModalProps,
    openSignatureModal() {
      setSignatureModalVisible(true);
    },
  };

  function getWrappedEncodeObjects(): EncodeObject[] {
    if (!data.proxyAddress) return data.encodeObjects;

    const sender = multisigKey.address;

    return [
      wrapMessages({
        messages: data.encodeObjects,
        sender,
        contract: data.proxyAddress,
      }),
    ];
  }
}
