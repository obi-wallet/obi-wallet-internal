import { pubkeyToAddress } from "@cosmjs/amino";
import { MsgInstantiateContractEncodeObject } from "@cosmjs/cosmwasm-stargate";
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
import { InstantiateMsg } from "@obi-wallet/proxy-contract";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LegacyAminoMultisigPublicKey } from "@terra-money/terra.js";
import { MsgInstantiateContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import Long from "long";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import invariant from "tiny-invariant";

import { IconButton } from "../../../button";
import { useMultisigWallet, useStore } from "../../../stores";
import { Background } from "../../components/background";
import { OnboardingRoute, OnboardingStackParamList } from "../onboarding-stack";

export type MultisigInitProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.CreateMultisigInit
>;

export const MultisigInit = observer<MultisigInitProps>(function MultisigInit({
  navigation,
}) {
  const { chainStore } = useStore();
  const wallet = useMultisigWallet();

  useEffect(() => {
    if (isAnyCosmosMultisigWallet(wallet)) {
      void handleCosmos({
        chainStore,
        wallet,
      });
    }
    if (isAnyTerraMultisigWallet(wallet)) {
      void handleTerra({
        chainStore,
        wallet,
      });
    }
  }, [chainStore, wallet]);

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
});

async function handleCosmos({
  chainStore,
  wallet,
}: {
  chainStore: ChainStore;
  wallet: CosmosMultisigWallet;
}) {
  const multisig = wallet.nextAdmin;

  if (!multisig.multisig?.address) return;

  const { currentCosmosChainInformation } = chainStore;

  const rawMessage: InstantiateMsg = {
    fee_lend_repay_wallet: currentCosmosChainInformation.debtRepayAddress,
    home_network: currentCosmosChainInformation.chainId,
    hot_wallets: [],
    owner: multisig.multisig.address,
    signer_types: wallet.getSignerTypes(multisig),
    signers: multisig.multisig.publicKey.value.pubkeys.map((pubkey) => {
      return pubkeyToAddress(pubkey, currentCosmosChainInformation.prefix);
    }),
    uusd_fee_debt: currentCosmosChainInformation.startingUsdDebt,
  };

  const value: MsgInstantiateContract = {
    sender: multisig.multisig.address,
    admin: multisig.multisig.address,
    // @ts-expect-error should be passed as a string
    codeId: Long.fromInt(
      currentCosmosChainInformation.currentCodeId
    ).toString(),
    label: "Obi Proxy",
    msg: new Uint8Array(Buffer.from(JSON.stringify(rawMessage))),
    funds: [],
  };
  const message: MsgInstantiateContractEncodeObject = {
    typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract",
    value,
  };

  const response = await RequestObiCosmosSignAndBroadcastMsg.send({
    id: wallet.id,
    encodeObjects: [message],
    multisig,
    cancelable: false,
    isOnboarding: true,
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
    const instantiateEvent = rawLog[0].events.find((e) => {
      return e.type === "instantiate";
    });
    invariant(
      instantiateEvent,
      "Expected `rawLog` to contain `instantiate` event."
    );
    const contractAddress = instantiateEvent.attributes.find((a) => {
      return a.key === "_contract_address";
    });
    invariant(
      contractAddress,
      "Expected `instantiateEvent` to contain `_contract_address` attribute."
    );
    await wallet.finishProxySetup({
      address: contractAddress.value,
      codeId: chainStore.currentCosmosChainInformation.currentCodeId,
    });
  } catch (e) {
    console.log(response.rawLog);
  }
}

async function handleTerra({
  chainStore,
  wallet,
}: {
  chainStore: ChainStore;
  wallet: TerraMultisigWallet;
}) {
  const multisig = wallet.nextAdmin;

  if (!multisig.multisig?.address) return;

  const { currentTerraChainInformation } = chainStore;

  const signerTypes = wallet.getSignerTypes(multisig);
  const signers = LegacyAminoMultisigPublicKey.fromAmino(
    multisig.multisig.publicKey
  ).pubkeys.map((publicKey, i) => {
    return {
      address: publicKey.address(),
      ty: signerTypes[i],
    };
  });

  const message = terra.getNewAccountMessage({
    address: multisig.multisig.address,
    signers,
    chainId: currentTerraChainInformation.chainId,
  });

  const response = await RequestObiTerraSignAndBroadcastMsg.send({
    id: wallet.id,
    messages: [message.toAmino()],
    multisig,
    cancelable: false,
    isOnboarding: true,
  });

  try {
    await wallet.finishProxySetup(terra.parseNewAccountResponse(response));
  } catch (e) {
    Alert.alert("Something went wrong");
  }
}
