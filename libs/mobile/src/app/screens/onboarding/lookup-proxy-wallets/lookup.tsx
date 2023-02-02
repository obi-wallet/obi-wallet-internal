import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faShare } from "@fortawesome/free-solid-svg-icons/faShare";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { CosmosChain, TerraChain, Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Linking, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as A from "./api-types";
import { IconButton } from "../../../button";
import { Background } from "../../components/background";
import { VerifyAndProceedButton } from "../../components/phone-number/verify-and-proceed-button";

export interface LookupProps {
  chainId: CosmosChain | TerraChain;
  publicKey: string;
  onSelect(wallet: A.SerializedProxyWallet): void;
  onCancel(): void;
}

export const Lookup = observer(function Lookup({
  chainId,
  publicKey,
  onSelect,
  onCancel,
}: LookupProps) {
  const [wallets, setWallets] = useState<A.SerializedProxyWallet[] | null>(
    null
  );
  const [selectedWallet, setSelectedWallet] =
    useState<A.SerializedProxyWallet | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `https://proxy-wallets.obiwallet.workers.dev/${chainId}/${encodeURIComponent(
            publicKey
          )}`,
          {
            headers: {
              "Api-Version": "v1",
            },
          }
        );
        const proxyWallets =
          (await response.json()) as A.SerializedProxyWallet[];
        setWallets(proxyWallets);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [chainId, publicKey]);

  if (!wallets) return null;

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
        <View style={{ flexShrink: 1 }}>
          <IconButton
            style={{
              marginTop: 20,
              marginLeft: -5,
              padding: 5,
              width: 25,
            }}
            onPress={() => {
              onCancel();
            }}
          >
            <FontAwesomeIcon
              icon={faChevronLeft}
              style={{ color: "#7B87A8" }}
            />
          </IconButton>
          <View style={{ justifyContent: "flex-end", marginTop: 43 }}>
            <View>
              <Text
                style={{
                  color: "#F6F5FF",
                  fontSize: 24,
                  fontWeight: "600",
                  marginTop: 32,
                }}
              >
                <FormattedMessage
                  id="recovery.choosewallet.title"
                  defaultMessage="Choose an existing wallet"
                />
              </Text>
              <Text
                style={{
                  color: "#999CB6",
                  fontSize: 14,
                  marginTop: 10,
                }}
              >
                {wallets.length > 0 ? (
                  <FormattedMessage
                    id="recovery.choosewallet.subtext"
                    defaultMessage="We found the following Obi Wallets associated with your phone number and security answer. Select the one you want to recover."
                  />
                ) : (
                  <FormattedMessage
                    id="recovery.choosewallet.subtextnone"
                    defaultMessage="We found no Obi Wallets associated with your phone number and security answer. Please try a different combination."
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
                    backgroundColor: "#111023",
                    marginBottom: 20,
                    flexDirection: "row",
                    borderRadius: 12,
                    paddingHorizontal: 10,
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
                      style={{ color: "#7B87A8" }}
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
                        wallet.proxyAddress.address,
                        20
                      )}
                    </Text>
                  </View>
                  <IconButton
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                    onPress={() => {
                      switch (chainId) {
                        case "uni-3":
                        case "juno-1":
                          Linking.openURL(
                            `https://www.mintscan.io/juno/wasm/contract/${wallet.proxyAddress.address}`
                          );
                          break;
                        case "pisco-1":
                        case "phoenix-1":
                          Linking.openURL(
                            `https://terrasco.pe/mainnet/contract/${wallet.proxyAddress.address}`
                          );
                          break;
                      }
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faShare}
                      style={{ color: "#7B87A8" }}
                    />
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
            onPress={() => {
              if (selectedWallet) {
                onSelect(selectedWallet);
              }
            }}
            style={{ marginBottom: 0 }}
          />
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {
                onCancel();
              }}
              style={{ paddingVertical: 15, paddingHorizontal: 15 }}
            >
              <Text style={{ color: "#787B9C", textAlign: "center" }}>
                <FormattedMessage
                  id="recovery.choosewallet.tryagain"
                  defaultMessage="Try a different combination"
                />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
});
