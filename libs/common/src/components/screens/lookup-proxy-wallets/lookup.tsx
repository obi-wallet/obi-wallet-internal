import { useTheme } from "@emotion/react";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faShare } from "@fortawesome/free-solid-svg-icons/faShare";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Chain, ChainId, GatekeeperConfig, ObservableKey, SecretJsClient, createGatekeeperConfig, secretJsChains } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Linking, ScrollView, TouchableOpacity, View } from "react-native";
import { useAsyncEffect } from "rooks";
import { SinglesigWallet } from "libs/sdk/src/data-structures/singlesig-wallet";

import * as A from "./api-types";
import * as R from "ramda";
import { useStore } from "../../../contexts";
import { isSmallScreenNumber } from "../../../helpers";
import { IconButton } from "../../buttons";
import { OnboardingScreenContainer } from "../../onboarding-screen-container";
import { Text } from "../../typography";
import { VerifyAndProceedButton } from "../../verify-and-proceed-button";
import { ethers } from "ethers";
import { MultisigWallet } from "libs/sdk/src/data-structures/multisig-wallet/implementation";
import { Key, KeyType, MultisigKey as MultisigKeyFactory, ObservableMultisigKey, Serialized } from "libs/sdk/src/data-structures";
import { MultisigKey } from "libs/sdk/src/data-structures/multisig-key/implementation";
import { createObservableMultisigKey } from "libs/sdk/src/data-structures/multisig-key/factories";
import invariant from "tiny-invariant";
import { KeyRoute, RecoverFrom } from "@obi-wallet/common";

export interface LookupProps {
  chainId: ChainId;
  publicKey: string;
  draftId: string;
  recoverFrom: RecoverFrom;
  onSelect(wallet: A.SerializedProxyWallet): Promise<void>;
  onCancel(): void;
}

export const Lookup = observer(function Lookup({
  chainId,
  publicKey,
  draftId,
  recoverFrom,
  onSelect,
  onCancel,
}: LookupProps) {
  const { chainStore, draftsStore, unityStore, walletsStore } = useStore();
  const [wallets, setWallets] = useState<A.SerializedProxyWallet[] | null>(
    null,
  );
  const draft = draftsStore.get<MultisigKey>({
    id: draftId,
  });
  const [selectedWallet, setSelectedWallet] =
    useState<A.SerializedProxyWallet | null>(null);
  const theme = useTheme();

  useAsyncEffect(async () => {
    try {
      const currentCodeId = Chain.select({
        chainId,
        onCosmosChain(chain) {
          return chain.currentCodeIds.userAccount;
        },
        onLegacyCosmosChain(chain) {
          return chain.currentCodeId;
        },
        onSecretJsChain(chain) {
          return chain.currentCodeIds.userEntry;
        },
        onTerraChain(chain) {
          return chain.currentCodeIds.userAccount;
        },
      });
      const body = JSON.stringify({
        chainId: "secret-4",
        publicKey,
        currentCodeId,
      });
      console.log("request body: " + body);
      const response = await fetch(
        `https://proxy-wallets.obiwallet.workers.dev`,
        // `http://127.0.0.1:8787`,
        {
          method: "POST",
          body: JSON.stringify({
            chainId: "secret-4",
            publicKey,
          }),
          headers: {
            "Api-Version": "v1",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          },
        },
      );
      let proxyWallets;
      try {
        proxyWallets = (await response.json()) as A.SerializedProxyWallet[];
      } catch(e) {
        console.log("Proxy wallet worker error. Response: " + response.text());
        throw new Error("error in proxy wallet worker response");
      }
      setWallets(proxyWallets);
    } catch (e) {
      console.log(e);
    }
  }, [chainId, publicKey]);

  if (!wallets) {
    // TODO: loading spinner instead
    return <OnboardingScreenContainer />;
  }

  return (
    <OnboardingScreenContainer>
      <View style={{ flexShrink: 1 }}>
        <View
          style={{
            justifyContent: "flex-end",
          }}
        >
          <View>
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: isSmallScreenNumber(18, 24),
                fontWeight: "600",
              }}
            >
              <FormattedMessage
                id="recovery.choosewallet.title"
                defaultMessage="Choose an existing wallet"
              />
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 14,
                marginVertical: 10,
              }}
            >
              {wallets.length > 0 ? (
                <FormattedMessage
                  id="recovery.choosewallet.subtext"
                  defaultMessage="We found the following Obi Wallets associated with your recovery key. Select the one you want to recover."
                />
              ) : (
                <FormattedMessage
                  id="recovery.choosewallet.subtextnone"
                  defaultMessage="We found no Obi Wallets associated with your recovery key. Please try a different combination."
                />
              )}
            </Text>
          </View>
        </View>
        <ScrollView>
          {wallets.map((wallet) => {
            const active = wallet === selectedWallet;

            return (
              <TouchableOpacity
                key={wallet.proxyAddress.address}
                style={{
                  height: 79,
                  width: "100%",
                  backgroundColor: theme.colors.panelBackground,
                  marginBottom: 20,
                  flexDirection: "row",
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  ...(active
                    ? {
                        borderWidth: 1,
                        borderColor: "white",
                      }
                    : {}),
                }}
                onPress={() => {
                  setSelectedWallet((selectedWallet) => {
                    return selectedWallet === wallet ? null : wallet;
                  });
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <FontAwesomeIcon
                    icon={active ? faCircleCheck : faCircle}
                    style={{ color: "white" }}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#F6F5FF",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {Bech32Address.shortenAddress(
                      wallet.evmUserContractAddress,
                      20,
                    )}
                  </Text>
                </View>
                <IconButton
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 10,
                  }}
                  onPress={async () => {
                    await Linking.openURL(
                      chainStore.currentChainInformation.explorerUrl(
                        wallet.evmUserContractAddress,
                      ),
                    );
                  }}
                >
                  <FontAwesomeIcon icon={faShare} style={{ color: "white" }} />
                </IconButton>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View
        style={{
          marginTop: 20,
          flexShrink: 0,
        }}
      >
        <VerifyAndProceedButton
          disabled={!selectedWallet}
          onPress={async () => {
            const chain = secretJsChains["secret-4"];
            const factories = {
              MultisigKeyFactory,
              SinglesigWallet,
              createGatekeeperConfig,
            };
            if (selectedWallet) {
              let activeDeviceKey;
              unityStore.getDeviceId
              ? activeDeviceKey = draft.value.getUsableKeyOfType(KeyType.Unity)
              : activeDeviceKey = draft.value.getUsableKeyOfType(KeyType.Device)

              const usableKey = draft.value.getUsableKeyOfType(
                recoverFrom === RecoverFrom.Email
                  ? KeyType.EmailRecovery
                  : KeyType.Phone,
              );
              
              const recoveredPhoneKey = draft.value.getUsableKeyOfType(
                KeyType.Phone,
              );
              const recoveredEmailKey = draft.value.getUsableKeyOfType(
                KeyType.EmailRecovery,
              );

              invariant(activeDeviceKey, "Device key is required");
              /* invariant(
                recoveredPhoneKey || recoveredEmailKey,
                "Phone or email key is required",
              ); */

              const serializedData: Serialized<MultisigWallet>["data"] = {
                chain: draft.value.chainId,
                owner: {
                  threshold: parseInt(selectedWallet.owner.threshold, 10),
                  keys: selectedWallet.owner.keys.map(
                    (key): Serialized<typeof Key> => {
                      switch (key.type) {
                        case KeyType.Device: {
                          return {
                            type: KeyType.Device,
                            payload: {
                              publicKey: key.publicKey,
                            },
                          };
                        }
                        case KeyType.Phone:
                          if (recoveredPhoneKey) {
                            invariant(
                              R.equals(
                                recoveredPhoneKey.payload.publicKey,
                                key.publicKey,
                              ),
                              "Recovered phone key must match the one in the proxy wallet",
                            );
                            return {
                              type: KeyType.Phone,
                              payload: {
                                ...recoveredPhoneKey.payload,
                                publicKey: key.publicKey,
                              },
                            };
                          } else {
                            return {
                              payload: {
                                type: key.type,
                                publicKey: key.publicKey,
                              },
                            };
                          }
                        case KeyType.Social:
                          return {
                            type: KeyType.Social,
                            payload: {
                              publicKey: key.publicKey,
                            },
                          };
                        case KeyType.Cloud:
                        case KeyType.Nfc:
                          return {
                            payload: {
                              type: key.type,
                              publicKey: key.publicKey,
                            },
                          };
                        case KeyType.Email:
                          if (
                            recoveredEmailKey &&
                            usableKey?.type === KeyType.EmailRecovery
                          ) {
                            return {
                              type: KeyType.EmailRecovery,
                              payload: {
                                publicKey: key.publicKey,
                                privateKey: usableKey.payload.privateKey,
                              },
                            };
                          } else {
                            return {
                              payload: {
                                type: key.type,
                                publicKey: key.publicKey,
                              },
                            };
                          }
                        default:
                          return {
                            payload: {
                              type: key.type,
                              publicKey: key.publicKey,
                            },
                          };
                      }
                    },
                  ),
                  evmSigningAddress: selectedWallet.evmSigningAddress!,
                  evmUserContractAddress: selectedWallet.evmUserContractAddress,
                },
                proxyAddress: {
                  v: 1,
                  address: selectedWallet.proxyAddress.address,
                },
                // TODO: fetch from chain?
                gatekeeperConfig: {
                  beneficiaries: [],
                  flexAccounts: [],
                },
                singlesigWallets: [],
                currentAccount: null,
                evmSigningAddress: selectedWallet.evmSigningAddress!,
                evmUserContractAddress: selectedWallet.evmUserContractAddress,
              };

              try {
                const currentOwner = ObservableMultisigKey.create(
                  {
                    homeAccountAddress: serializedData.proxyAddress.address,
                    evmSigningAddress: serializedData.evmSigningAddress,
                    evmUserContractAddress: serializedData.evmUserContractAddress,
                    ownerIndex: 0
                  },
                  serializedData.chain,
                  serializedData.owner,
                );

                draft.commit({ original: currentOwner });
                const newOwner = draft.value;
                draft.value.setDeviceKey(activeDeviceKey.payload);
                console.log("recovered draft: " + JSON.stringify(draft.value));
                const newWallet = await walletsStore.createWallet({
                  multisigKey: draft.value,
                  demoMode: false,
                  skipInit: true,
                  evmSigningAddressOverride: serializedData.evmSigningAddress,
                  evmUserContractAddressOverride: serializedData.evmUserContractAddress,
                  homeAccountAddressOverride: serializedData.proxyAddress.address
                });

                /*navigation.navigate(OnboardingRoute.RecoverWallet, {
                  ...params,
                  serializedData,
                });*/
              } catch (e) {
                console.log(e);
              }
            }
          }}
        />
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => {
              onCancel();
            }}
            style={{ paddingTop: 15, paddingHorizontal: 15 }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
              }}
            >
              <FormattedMessage
                id="recovery.choosewallet.tryagain"
                defaultMessage="Try a different key instead"
              />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingScreenContainer>
  );
});
