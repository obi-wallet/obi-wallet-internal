import { AminoSignResponse, serializeSignDoc } from "@cosmjs/amino";
import { Sha256 } from "@cosmjs/crypto";
import { useTheme } from "@emotion/react";
import {
  isSecretJsChain,
  MultisigKey,
  RpcError,
  Secp256k1PrivateKeySigner,
  secretJsChains,
  Signer,
  Wallets,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BaseAccount } from "cosmjs-types/cosmos/auth/v1beta1/auth";
import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BroadcastMode,
  MsgExecuteContract,
  pubkeyToAddress,
  SecretNetworkClient,
} from "secretjs";
import {
  AccountData,
  AminoSigner,
  StdSignDoc,
} from "secretjs/dist/wallet_amino";
import { encodeSecp256k1Signature } from "secretjs/src/wallet_amino";
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

class SecretJsAminoSigner implements AminoSigner {
  protected constructor(
    protected signer: Signer,
    protected prefix: string,
  ) {}

  public static fromSigner({
    signer,
    prefix,
  }: {
    signer: Signer;
    prefix: string;
  }) {
    return new SecretJsAminoSigner(signer, prefix);
  }

  public get address(): string {
    return pubkeyToAddress(this.publicKey, this.prefix);
  }

  protected get publicKey(): Uint8Array {
    return new Uint8Array(Buffer.from(this.signer.publicKey.value, "base64"));
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        algo: "secp256k1",
        address: this.address,
        pubkey: this.publicKey,
      },
    ];
  }

  public async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc,
  ): Promise<AminoSignResponse> {
    if (signerAddress !== this.address) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }
    const signature = await this.signStdSignDoc(signDoc);
    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(this.publicKey, signature),
    };
  }

  public async signStdSignDoc(signDoc: StdSignDoc) {
    const hash = new Sha256(serializeSignDoc(signDoc)).digest();
    return await this.signer.signHash(hash);
  }
}

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

  const wallet = SecretJsAminoSigner.fromSigner({
    signer: new Secp256k1PrivateKeySigner(DEMO_PRIVATE_KEY),
    prefix: chain.prefix,
  });
  const walletAddress = wallet.address;
  const client = new SecretNetworkClient({
    // Create a client to interact with the network
    url: chain.urls[0],
    chainId: chain.chainId,
    wallet,
    walletAddress,
  });

  // TODO: handle key preparation
  let account: { account?: BaseAccount | undefined } = {};
  try {
    account = (await client.query.auth.account({
      address: walletAddress,
    })) as { account?: BaseAccount | undefined };
  } catch (e) {
    const data = RpcError.safeParse(e);
    if (data.success && data.data.message.includes("code = NotFound")) {
      // TODO: lend fees
      console.log("Need to prepare account", walletAddress);
      return;
    }
  }

  if (!account.account) return;

  const message = new MsgExecuteContract({
    sender: walletAddress,
    contract_address: chain.accountCreatorAddress,
    msg: {
      new_account: {
        fee_debt: parseInt(chain.startingUsdDebt, 10),
        gatekeeper_authorizations: {
          beneficiary_auths: [],
          message_auths: [],
          sessionkeys: [],
          spendlimit_auths: [],
        },
        owner: walletAddress,
        signers: {
          signers: [
            {
              address: walletAddress,
              ty: "z-auth",
            },
          ],
        },
        update_delay: 0,
      },
    },
    code_hash:
      // TODO: fetch & cache via TanStack Query
      "b60a33a7753647900c2708028d8c370e0a5f1b42ab10a5558ef58031f7e4a8a7",
  });

  const txOptions = {
    gasLimit: 4_000_000,
    gasPriceInFeeDenom: 0.1,
    feeDenom: "uscrt",
    broadcastMode: BroadcastMode.Block,
    waitForCommit: true,
  };
  const response = await client.tx.broadcast([message], txOptions);

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
