import {
  AminoMsg,
  coins,
  Secp256k1Wallet,
  serializeSignDoc,
  StdSignDoc,
} from "@cosmjs/amino";
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
  createStargateClient,
  isAnyMultisigWallet,
  isMultisigDemoWallet,
  isCosmosSinglesigWallet,
  lendFees,
  RequestObiCosmosSignAndBroadcastPayload,
  CosmosSinglesigWallet,
  WalletType,
} from "@obi-wallet/common";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "react-native";
import invariant from "tiny-invariant";

import { wrapMessages } from "./wrap-messages";
import { createBiometricSignature } from "../../../biometrics";
import { createSigningCosmWasmClient } from "../../../clients";
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
import { ConfirmMessages } from "../confirm-messages";
import {
  MultisigConfirmMessages,
  MultisigConfirmMessagesProps,
} from "../multisig-confirm-messages";
import { PhoneNumberBottomSheetContent } from "../phone-number-bottom-sheet-content";

type CosmosMultisigWallet = unknown;
type CosmosMultisig = unknown;
type CosmosMultisigKey = unknown;

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
  wallet: CosmosMultisigWallet | CosmosSinglesigWallet;
  innerMessages: AminoMsg[];
  messages: AminoMsg[];
  rawMessages: EncodeObject[];
  multisig?: CosmosMultisig | null;
  hiddenKeyIds?: CosmosMultisigKey[];
  onConfirm(signatures: Map<string, Uint8Array>): void;
}

export const CosmosSignatureModal = observer<CosmosSignatureModalProps>(
  function CosmosSignatureModal(props) {
    // TODO:
    return null;
    //   if (!props.wallet.type) return null;
    //
    //   switch (props.wallet.type) {
    //     case WalletType.CosmosMultisig:
    //       return <CosmosSignatureModalMultisig {...props} />;
    //     case WalletType.CosmosSinglesig:
    //       return <CosmosSignatureModalSinglesig {...props} />;
    //   }
    //
    //   return null;
  }
);

export const CosmosSignatureModalSinglesig =
  observer<CosmosSignatureModalProps>(function CosmosSignatureModalSinglesig({
    onCancel,
    onConfirm,
    isOnboarding,
    ...props
  }) {
    const [loading, setLoading] = useState(false);
    const intl = useIntl();

    return (
      <ConfirmMessages
        {...props}
        isOnboarding={isOnboarding}
        loading={loading}
        messages={props.innerMessages}
        onCancel={onCancel}
        onConfirm={async () => {
          try {
            setLoading(true);
            await onConfirm(new Map());
            setLoading(false);
          } catch (e) {
            const error = e as Error;
            setLoading(false);
            console.error(error);
            Alert.alert(
              intl.formatMessage({
                id: "signature.error.confirmingtx",
                defaultMessage: "Error Confirming Transaction",
              }),
              error.message
            );
          }
        }}
      />
    );
  });

export const CosmosSignatureModalMultisig = observer<
  CosmosSignatureModalProps & { multisig?: CosmosMultisig | null }
>(function SignatureModalMultisig({
  wallet,
  innerMessages,
  messages,
  rawMessages,
  multisig,
  onConfirm,
  hiddenKeyIds,
  ...props
}: CosmosSignatureModalProps) {
  // TOOD:
  return null;
  // const intl = useIntl();
  // const [signatures, setSignatures] = useState(new Map<string, Uint8Array>());
  // const phoneNumberBottomSheetRef = useRef<BottomSheetRef>(null);
  // const { chainStore } = useStore();
  // const { currentCosmosChainInformation } = chainStore;
  // const numberOfSignatures = signatures.size;
  // const threshold = multisig?.multisig?.publicKey.value.threshold;
  //
  // const getMessage = useCallback(async () => {
  //   const address = multisig?.multisig?.address;
  //
  //   const fee = {
  //     amount: coins(6000, currentCosmosChainInformation.denom),
  //     gas: "1280000",
  //   };
  //
  //   invariant(address, "Expected `address` to exist.");
  //
  //   const client = await createStargateClient(
  //     currentCosmosChainInformation.chainId
  //   );
  //
  //   if (!(await client.getAccount(address))) {
  //     await lendFees({
  //       chainId: currentCosmosChainInformation.chainId,
  //       address,
  //     });
  //   }
  //
  //   const account = await client.getAccount(address);
  //   invariant(account, "Expected `account` to be ready.");
  //
  //   const signDoc: StdSignDoc = {
  //     memo: "",
  //     account_number: account.accountNumber.toString(),
  //     chain_id: currentCosmosChainInformation.chainId,
  //     fee: fee,
  //     msgs: messages,
  //     sequence: account.sequence.toString(),
  //   };
  //
  //   client.disconnect();
  //   return new Sha256(serializeSignDoc(signDoc)).digest();
  // }, [
  //   multisig,
  //   currentCosmosChainInformation.denom,
  //   currentCosmosChainInformation.chainId,
  //   messages,
  // ]);
  //
  // function getKey({
  //   id,
  //   title,
  // }: {
  //   id: CosmosMultisigKey;
  //   title: string;
  // }): Key[] {
  //   const factor = multisig?.[id];
  //   if (!factor) return [];
  //
  //   const alreadySigned = signatures.has(factor.address);
  //   const onPress = async () => {
  //     if (alreadySigned) return;
  //
  //     switch (id) {
  //       case "biometrics": {
  //         const message = await getMessage();
  //         const { signature } = await createBiometricSignature({
  //           payload: message,
  //           demoMode: isMultisigDemoWallet(wallet),
  //         });
  //         const biometrics = multisig?.biometrics;
  //         invariant(biometrics, "Expected device key to exist.");
  //
  //         setSignatures((signatures) => {
  //           return new Map(signatures.set(biometrics.address, signature));
  //         });
  //         break;
  //       }
  //       case "phoneNumber":
  //         phoneNumberBottomSheetRef.current?.snapToIndex(0);
  //         break;
  //       case "cloud":
  //         console.log("Not implemented yet");
  //         break;
  //     }
  //   };
  //
  //   return [
  //     {
  //       id,
  //       title,
  //       signed: alreadySigned,
  //       right: alreadySigned ? <CheckIcon /> : null,
  //       onPress,
  //     },
  //   ];
  // }
  //
  // const data: Key[] = [
  //   ...getKey({
  //     id: "biometrics",
  //     title: intl.formatMessage({
  //       id: "signature.modal.biometricsignature",
  //       defaultMessage: "Biometrics Signature",
  //     }),
  //   }),
  //   ...getKey({
  //     id: "phoneNumber",
  //     title: intl.formatMessage({
  //       id: "signature.modal.phonesignature",
  //       defaultMessage: "Phone Number Signature",
  //     }),
  //   }),
  // ].filter((key) => {
  //   return hiddenKeyIds ? !hiddenKeyIds.includes(key.id) : true;
  // });
  //
  // if (!threshold) return null;
  //
  // return (
  //   <MultisigConfirmMessages
  //     {...props}
  //     threshold={parseInt(threshold, 10)}
  //     numberOfSignatures={numberOfSignatures}
  //     data={data}
  //     innerMessages={innerMessages}
  //     onConfirm={async () => {
  //       await onConfirm(signatures);
  //     }}
  //     footer={
  //       multisig?.phoneNumber ? (
  //         <BottomSheet bottomSheetRef={phoneNumberBottomSheetRef}>
  //           <PhoneNumberBottomSheetContent
  //             securityQuestion={multisig.phoneNumber.securityQuestion}
  //             onRequest={async (securityAnswer) => {
  //               invariant(
  //                 multisig.phoneNumber,
  //                 "Expected phoneNumber key to exist"
  //               );
  //
  //               const message = await getMessage();
  //               await sendSignatureTextMessage({
  //                 phoneNumber: multisig.phoneNumber.phoneNumber,
  //                 securityAnswer,
  //                 message,
  //                 demoMode: isMultisigDemoWallet(wallet),
  //                 chainId: currentCosmosChainInformation.chainId,
  //               });
  //             }}
  //             onConfirm={async (key) => {
  //               const signature = await parseSignatureTextMessageResponse({
  //                 key,
  //                 demoMode: isMultisigDemoWallet(wallet),
  //               });
  //               if (signature) {
  //                 setSignatures((signatures) => {
  //                   const { phoneNumber } = multisig;
  //                   invariant(
  //                     phoneNumber,
  //                     "Expected phone number key to exist."
  //                   );
  //                   return new Map(
  //                     signatures.set(phoneNumber.address, signature)
  //                   );
  //                 });
  //
  //                 phoneNumberBottomSheetRef.current?.close();
  //               }
  //             }}
  //           />
  //         </BottomSheet>
  //       ) : null
  //     }
  //   />
  // );
});

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
  // signatureModalProps: CosmosSignatureModalProps;
  // openSignatureModal: () => void;
} {
  // TODO:
  return {};
  // const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  // const [modalKey, setModalKey] = useState(0);
  // const { chainStore, walletsStore } = useStore();
  // const { currentCosmosChainInformation } = chainStore;
  //
  // const { id, multisig } = data;
  // const wallet = walletsStore.getWallet(id);
  //
  // const wrappedEncodeObjects = getWrappedEncodeObjects();
  // const innerEncodeObjects = data.encodeObjects;
  //
  // const signatureModalProps = useMemo(() => {
  //   const innerAminoMessages = innerEncodeObjects.map((encodeObject) => {
  //     return aminoTypes.toAmino(encodeObject);
  //   });
  //   const aminoMessages = wrappedEncodeObjects.map((encodeObject) => {
  //     return aminoTypes.toAmino(encodeObject);
  //   });
  //   const messages = aminoMessages.map((message) => {
  //     return aminoTypes.fromAmino(message);
  //   });
  //
  //   return {
  //     key: modalKey.toString(),
  //     wallet: wallet as CosmosMultisigWallet | CosmosSinglesigWallet,
  //     visible: signatureModalVisible,
  //     innerMessages: innerAminoMessages,
  //     messages: aminoMessages,
  //     rawMessages: messages,
  //     multisig,
  //     cancelable: data.cancelable,
  //     hiddenKeyIds: data.hiddenKeyTypes,
  //     isOnboarding: data.isOnboarding,
  //     onCancel() {
  //       setSignatureModalVisible(false);
  //       setModalKey((value) => value + 1);
  //     },
  //     async onConfirm(signatures: Map<string, Uint8Array>) {
  //       async function handleMultisig() {
  //         if (!multisig?.multisig) return;
  //
  //         const client = await createStargateClient(
  //           currentCosmosChainInformation.chainId
  //         );
  //
  //         const { chainId, denom } = currentCosmosChainInformation;
  //
  //         console.log(messages);
  //
  //         const body: TxBodyEncodeObject = {
  //           typeUrl: "/cosmos.tx.v1beta1.TxBody",
  //           value: {
  //             messages,
  //             memo: "",
  //           },
  //         };
  //         const bodyBytes = registry.encode(body);
  //
  //         const address = multisig.multisig.address;
  //         const feeAmount = 6000;
  //         const fee = {
  //           amount: coins(feeAmount, denom),
  //           gas: "1280000",
  //         };
  //
  //         if (!(await client.getAccount(address))) {
  //           await lendFees({ chainId, address });
  //         }
  //
  //         async function hasEnoughForFees() {
  //           const balance = await client?.getBalance(address, denom);
  //           return balance && parseInt(balance.amount, 10) >= feeAmount;
  //         }
  //
  //         while (!(await hasEnoughForFees())) {
  //           await lendFees({ chainId, address });
  //         }
  //
  //         const account = await client.getAccount(address);
  //         invariant(account, "Expected `account` to be ready.");
  //
  //         const tx = makeMultisignedTx(
  //           multisig.multisig.publicKey,
  //           account.sequence,
  //           fee,
  //           bodyBytes,
  //           signatures
  //         );
  //
  //         const result = await client.broadcastTx(
  //           Uint8Array.from(TxRaw.encode(tx).finish())
  //         );
  //
  //         client.disconnect();
  //         await onConfirm(result);
  //       }
  //
  //       switch (wallet.type) {
  //         case WalletType.CosmosMultisig:
  //           await handleMultisig();
  //           break;
  //         case WalletType.CosmosSinglesig: {
  //           invariant(
  //             isCosmosSinglesigWallet(wallet),
  //             "Expected `wallet` to be singlesig wallet."
  //           );
  //
  //           invariant(
  //             wallet.privateKey,
  //             "Expected `wallet.privateKey` to exist."
  //           );
  //
  //           const signer = await Secp256k1Wallet.fromKey(
  //             wallet.privateKey,
  //             currentCosmosChainInformation.prefix
  //           );
  //           const client = await createSigningCosmWasmClient({
  //             chainId: currentCosmosChainInformation.chainId,
  //             signer,
  //           });
  //
  //           invariant(wallet.address, "Expected `wallet.address` to exist.");
  //
  //           const result = await client.signAndBroadcast(
  //             wallet.address,
  //             messages,
  //             "auto"
  //           );
  //
  //           client.disconnect();
  //           await onConfirm(result);
  //         }
  //       }
  //
  //       setSignatureModalVisible(false);
  //       setModalKey((value) => value + 1);
  //     },
  //   };
  // }, [
  //   innerEncodeObjects,
  //   wrappedEncodeObjects,
  //   modalKey,
  //   wallet,
  //   signatureModalVisible,
  //   multisig,
  //   data,
  //   currentCosmosChainInformation,
  //   onConfirm,
  // ]);
  //
  // return {
  //   signatureModalProps,
  //   openSignatureModal() {
  //     setSignatureModalVisible(true);
  //   },
  // };
  //
  // function getWrappedEncodeObjects(): EncodeObject[] {
  //   if (!isAnyMultisigWallet(wallet) || !data.wrap) return data.encodeObjects;
  //
  //   const multisig = data.multisig;
  //   if (!multisig?.multisig?.address || !wallet.proxyAddress) {
  //     return [];
  //   }
  //   return [
  //     wrapMessages({
  //       messages: data.encodeObjects,
  //       sender: multisig.multisig.address,
  //       contract: wallet.proxyAddress.address,
  //     }),
  //   ];
  // }
}
