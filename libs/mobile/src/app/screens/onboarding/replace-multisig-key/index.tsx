import { pubkeyToAddress } from "@cosmjs/amino";
import {
  MsgExecuteContractEncodeObject,
  MsgUpdateAdminEncodeObject,
} from "@cosmjs/cosmwasm-stargate";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  ChainStore,
  CosmosMultisigWallet,
  isAnyCosmosMultisigWallet,
  isAnyTerraMultisigWallet,
  RequestObiCosmosSignAndBroadcastMsg,
  RequestObiTerraSignAndBroadcastMsg,
  terra,
  TerraMultisigWallet,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  MsgExecuteContract,
  MsgUpdateAdmin,
} from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";

import { IconButton } from "../../../button";
import { useMultisigWallet, useStore } from "../../../stores";
import { Background } from "../../components/background";
import { OnboardingRoute, OnboardingStackParamList } from "../onboarding-stack";

export type ReplaceMultisigProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.ReplaceMultisig
>;

export const ReplaceMultisig = observer<ReplaceMultisigProps>(
  function ReplaceMultisig({ navigation }) {
    const { chainStore } = useStore();
    const wallet = useMultisigWallet();

    useEffect(() => {
      if (isAnyCosmosMultisigWallet(wallet)) {
        void handleCosmos({
          chainStore,
          navigation,
          wallet,
        });
      }

      if (isAnyTerraMultisigWallet(wallet)) {
        void handleTerra({
          chainStore,
          navigation,
          wallet,
        });
      }
    }, [chainStore, navigation, wallet, wallet.updateProposed]);

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Background />

        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "space-between",
          }}
        >
          <View>
            <IconButton
              style={{
                marginTop: 20,
                marginLeft: -5,
                padding: 5,
                width: 25,
              }}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ color: "#7B87A8" }}
              />
            </IconButton>
          </View>
        </View>
      </SafeAreaView>
    );
  }
);

async function handleCosmos({
  chainStore,
  navigation,
  wallet,
}: {
  chainStore: ChainStore;
  navigation: ReplaceMultisigProps["navigation"];
  wallet: CosmosMultisigWallet;
}) {
  const multisig = wallet.currentAdmin;
  const nextMultisig = wallet.nextAdmin;

  const { currentCosmosChainInformation } = chainStore;

  const sender = wallet.updateProposed ? nextMultisig : multisig;

  if (!multisig?.multisig?.address) return;
  if (!nextMultisig.multisig?.address) return;
  if (!sender?.multisig?.address) return;
  if (!wallet.address) return;

  const encodeObjects = (() => {
    if (wallet.updateProposed) {
      return [
        wrapRawMessage({
          rawMessage: {
            confirm_update_admin: {
              signers: nextMultisig.multisig.publicKey.value.pubkeys.map(
                (pubkey) => {
                  return pubkeyToAddress(
                    pubkey,
                    currentCosmosChainInformation.prefix
                  );
                }
              ),
            },
          },
          sender: sender.multisig.address,
          contract: wallet.address,
        }),
      ];
    } else {
      const value: MsgUpdateAdmin = {
        sender: sender.multisig.address,
        newAdmin: nextMultisig.multisig.address,
        contract: wallet.address,
      };
      const message: MsgUpdateAdminEncodeObject = {
        typeUrl: "/cosmwasm.wasm.v1.MsgUpdateAdmin",
        value,
      };

      return [
        wrapRawMessage({
          rawMessage: {
            propose_update_admin: {
              new_admin: nextMultisig.multisig.address,
            },
          },
          sender: sender.multisig.address,
          contract: wallet.address,
        }),
        ...(multisig.multisig.address === nextMultisig.multisig.address
          ? []
          : [message]),
      ];
    }

    function wrapRawMessage({
      rawMessage,
      contract,
      sender,
    }: {
      rawMessage: unknown;
      contract: string;
      sender: string;
    }): MsgExecuteContractEncodeObject {
      const value: MsgExecuteContract = {
        sender,
        contract,
        msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
        funds: [],
      };
      return {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value,
      };
    }
  })();

  try {
    const response = await RequestObiCosmosSignAndBroadcastMsg.send({
      id: wallet.id,
      encodeObjects,
      multisig: sender,
    });

    try {
      invariant(response.rawLog, "Expected `response` to have `rawLog`.");
      const rawLog = JSON.parse(response.rawLog) as [
        {
          events: [
            {
              type: string;
              attributes: { key: string; value: string }[];
            }
          ];
        }
      ];
      const executeEvent = rawLog[0].events.find((e) => {
        return e.type === "execute";
      });
      invariant(executeEvent, "Expected `rawLog` to contain `execute` event.");
      const contractAddress = executeEvent.attributes.find((a) => {
        return a.key === "_contract_address";
      });
      invariant(
        contractAddress,
        "Expected `executeEvent` to contain `_contract_address` attribute."
      );
      if (wallet.updateProposed) {
        await wallet.finishProxySetup({
          address: contractAddress.value,
          // TODO: this might not be the case, need to fetch from chain
          codeId: chainStore.currentCosmosChainInformation.currentCodeId,
        });
      } else {
        wallet.setUpdateProposed(true);
      }
    } catch (e) {
      console.log(response.rawLog);
    }
  } catch (e) {
    console.log(e);
    navigation.goBack();
  }
}

async function handleTerra({
  chainStore,
  navigation,
  wallet,
}: {
  chainStore: ChainStore;
  navigation: ReplaceMultisigProps["navigation"];
  wallet: TerraMultisigWallet;
}) {
  const multisig = wallet.currentAdmin;
  const nextMultisig = wallet.nextAdmin;
  const sender = wallet.updateProposed ? nextMultisig : multisig;

  if (!nextMultisig.multisig?.address) return;
  if (!sender?.multisig?.address) return;
  if (!wallet.address) return;

  const messages = (() => {
    if (wallet.updateProposed) {
      return [
        terra.getConfirmUpdateOwnerMessage({
          sender: sender?.multisig?.address,
          proxyAddress: wallet.address,
        }),
      ];
    } else {
      return [
        terra.getProposeUpdateOwnerMessage({
          sender: sender?.multisig?.address,
          proxyAddress: wallet.address,
          newOwner: nextMultisig?.multisig?.address,
        }),
      ];
    }
  })();

  try {
    const response = await RequestObiTerraSignAndBroadcastMsg.send({
      id: wallet.id,
      messages: messages.map((message) => message.toAmino()),
      multisig: sender,
    });

    try {
      const { address } = terra.parseProposeUpdateOwnerResponse(response);
      if (wallet.updateProposed) {
        await wallet.finishProxySetup({
          address,
          // TODO: this might not be the case, need to fetch from chain
          codeId: chainStore.currentTerraChainInformation.currentCodeId,
        });
      } else {
        wallet.setUpdateProposed(true);
      }
    } catch (e) {
      console.log(response.raw_log);
    }
  } catch (e) {
    console.log(e);
    navigation.goBack();
  }
}
