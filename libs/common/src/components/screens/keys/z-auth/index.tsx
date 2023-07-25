import { useTheme } from "@emotion/react";
import {
  AccountValidationResult,
  isSecretJsChain,
  Messages,
  MultisigKey,
  Sdk,
  Secp256k1PrivateKeySigner,
  SecretJsAminoSigner,
  secretJsChains,
  SecretJsClient,
  Wallets,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TxResponse } from "secretjs";
import invariant from "tiny-invariant";

import { useStore } from "../../../../contexts";
import { createSessionKey, isSmallScreenNumber } from "../../../../helpers";
import { KeyRoute, KeyStackParamList } from "../../../../router";
import { Draft } from "../../../../stores";
import { AsyncButton } from "../../../buttons";
import { KeyboardAwareScrollView } from "../../../keyboard-aware-scroll-view";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";
import { Text } from "../../../typography";

const DEMO_PUBLIC_KEY = "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI";
const DEMO_PRIVATE_KEY = "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=";

export type ZAuthKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.ZAuthKey
>;

export const ZAuthKeyScreen = observer<ZAuthKeyScreenProps>(
  function ZAuthKeyScreen({ route }) {
    const { params } = route;

    const { walletsStore } = useStore();
    const theme = useTheme();

    return (
      <ZAuthKey
        {...params}
        onSubmit={async () => {
          if (theme.loginModal) {
            const wallet = walletsStore.currentWallet;

            if (!wallet) {
              console.log("no wallet");
              return;
            }

            await createSessionKey({
              wallet,
              maxSpend: 5,
              isLogin: true,
            });
          }
        }}
      />
    );
  },
);

export interface ZAuthKeyProps {
  draftId: string;
  demoMode: boolean;

  onSubmit(): Promise<void>;
}
export const ZAuthKey = observer<ZAuthKeyProps>(function ZAuthKey({
  draftId,
  onSubmit,
}) {
  const { draftsStore, walletsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  const theme = useTheme();

  return (
    <OsmosisScreenContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={{
            flex: 1,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{
            flex: 1,
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: isSmallScreenNumber(20, 24),
                fontWeight: "600",
                color: "#F6F5FF",
                marginTop: 79,
              }}
            >
              Create your ZAuth Key
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: isSmallScreenNumber(12, 14),
                marginTop: 10,
                ...theme.textStyles.light,
              }}
            >
              This screen would start the Zepeto authentication flow
              (implementation pending).
            </Text>
          </View>
          <View
            style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 20 }}
          >
            <AsyncButton
              label="Log in with Zepeto and create wallet"
              flavor="primary"
              onPress={async () => {
                draft.value.setZAuthKey({
                  type: "tendermint/PubKeySecp256k1",
                  value: DEMO_PUBLIC_KEY,
                });

                await createSecretJsWallet({
                  draft,
                  walletsStore,
                });

                await onSubmit();
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </OsmosisScreenContainer>
  );
});

async function createSecretJsWallet({
  draft,
  walletsStore,
}: {
  draft: Draft<MultisigKey>;
  walletsStore: Wallets;
}) {
  const chainId = draft.value.chainId;
  invariant(isSecretJsChain(chainId), "Expected Secret.js chain");

  const chain = secretJsChains[chainId];
  const sdk = Sdk.chainId(chainId);
  const messagesSdk = Messages.chainId(chainId);

  const signer = SecretJsAminoSigner.fromSigner({
    signer: new Secp256k1PrivateKeySigner(DEMO_PRIVATE_KEY),
    prefix: chain.prefix,
  });
  const client = new SecretJsClient(chainId);

  const walletAddress = signer.address;
  const accountValidationResult = await sdk.transactions.validateAccount(
    walletAddress,
  );
  if (accountValidationResult < AccountValidationResult.ACCOUNT_NOT_READY) {
    console.log("Need to prepare account", walletAddress);
    return;
  }

  const signedTransaction = await client.createAndSignTransaction({
    signer: new Secp256k1PrivateKeySigner(DEMO_PRIVATE_KEY),
    messages: [messagesSdk.getCreateWalletMessage(draft.value)],
  });
  const response = (await client.broadcastSignedTransaction(signedTransaction))
    .rawResult as TxResponse;

  try {
    const contractAddress = response.arrayLog?.find((log) => {
      return log.type === "instantiate" && log.key === "contract_address";
    })?.value;

    invariant(contractAddress, "No contract address found");

    await walletsStore.__internal_createWallet({
      multisigKey: draft.value,
      proxyAddress: contractAddress,
      demoMode: false,
    });
  } catch (e) {
    console.log("original error", e);
    console.log("Could not parse log", response);
  }
}
