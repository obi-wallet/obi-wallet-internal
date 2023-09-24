/* eslint-disable @nx/enforce-module-boundaries */
import { useTheme } from "@emotion/react";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faShare } from "@fortawesome/free-solid-svg-icons/faShare";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { RecoverFrom } from "@obi-wallet/common";
import { Chain, ChainId, MultisigKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Linking, ScrollView, TouchableOpacity, View } from "react-native";
import { useAsyncEffect } from "rooks";

import * as A from "./api-types";
import { useStore } from "../../../contexts";
import {
  activatedRecoveredWallet,
  addEllipsisInMiddle,
  getProxyWalletsCloudflare,
  isSmallScreenNumber,
} from "../../../helpers";
import { IconButton } from "../../buttons";
import { OnboardingScreenContainer } from "../../onboarding-screen-container";
import { Text } from "../../typography";
import { VerifyAndProceedButton } from "../../verify-and-proceed-button";

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
  const _onSelect = onSelect;
  const store = useStore();
  const { chainStore, draftsStore } = store;
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
      const _currentCodeId = Chain.select({
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
      const proxyWallets = (await getProxyWalletsCloudflare(
        publicKey,
      )) as A.SerializedProxyWallet[];
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
                    {addEllipsisInMiddle(wallet.evmUserContractAddress, 20)}
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
            if (selectedWallet) {
              try {
                activatedRecoveredWallet(
                  draft,
                  recoverFrom,
                  store,
                  selectedWallet,
                );
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
                marginBottom: 15,
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
