import { useTheme } from "@emotion/react";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons/faPaperclip";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  App,
  Button as ObiButton,
  Text,
  TextInput,
  useStore,
} from "@obi-wallet/common";
import { Card, Tile, Tiles } from "@obi-wallet/common-deprecated";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import { isTerraChain } from "@obi-wallet/sdk";
import WalletConnect from "@walletconnect/client";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useIntl } from "react-intl";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChevronCircleLeft from "./assets/chevron-circle-left.svg";
import HistoryIcon from "./assets/history.svg";
import Wcqr from "./assets/wcqr.svg";
import { InlineButton } from "../../button";
import { RootRoute, useRootNavigation } from "../../root-stack";
import { parseDynamicLinkURL } from "../components/connected-web-view";
import { useQrCodeScannerModal } from "../components/qr-code-scanner-modal";

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
  },
});

export const DappExplorer = observer(function DappExplorer() {
  const rootStore = useStore();
  const wallet = useCurrentWallet();
  const safeArea = useSafeAreaInsets();
  const theme = useTheme();
  const [showConnections, setShowConnections] = useState(false);
  const { walletConnectStore } = rootStore;

  const qrCodeScannerModal = useQrCodeScannerModal(({ data, close }) => {
    if (data.startsWith("https://terrastation.page.link")) {
      const payload = parseDynamicLinkURL(data)?.searchParams.get("payload");
      if (payload) {
        close();
        void walletConnectStore.connect({
          uri: payload,
          walletMeta: wallet.meta,
        });
      }
    }
  });

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <KeyboardAvoidingView
        style={{
          marginBottom: safeArea.bottom,
          height: "100%",
          paddingBottom: 10,
        }}
        behavior="height"
        keyboardVerticalOffset={safeArea.bottom + 20}
      >
        <View
          style={{
            flexDirection: "row",
            // backgroundColor: "yellow",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
        >
          <TouchableOpacity
            style={{
              borderRadius: 10,
              padding: 10,
              backgroundColor: showConnections ? "transparent" : "#272727",
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              setShowConnections(!showConnections);
            }}
          >
            {showConnections && <ChevronCircleLeft />}
            <Text style={{ color: "white", fontWeight: "600" }}>
              {showConnections ? "" : "Connections"}
            </Text>
            {!showConnections && (
              <View
                style={{
                  marginLeft: 5,
                  backgroundColor: "#1a1a1a",
                  borderRadius: 7,
                  padding: 5,
                  minHeight: 20,
                  minWidth: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  {walletConnectStore.connectors.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {showConnections && (
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Connections
            </Text>
          )}
          {qrCodeScannerModal.render()}
          <TouchableOpacity
            style={{
              padding: 5,
              backgroundColor: "#272727",
              borderRadius: 7,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              qrCodeScannerModal.open();
            }}
          >
            <Wcqr />
          </TouchableOpacity>
        </View>
        {showConnections ? <ConnectionsScreen /> : <AppsScreen />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const ConnectionsScreen = observer(function ConnectionsScreen() {
  const { walletConnectStore } = useStore();

  return (
    <View style={{ flex: 1 }}>
      {walletConnectStore.connectors.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>
            No connections
          </Text>
        </View>
      ) : (
        <>
          <ScrollView style={{ flex: 1, marginHorizontal: 10 }}>
            {walletConnectStore.connectors.map(({ connector }) => {
              return <ConnectedDapp dapp={connector} key={connector.key} />;
            })}
          </ScrollView>

          <View
            style={{
              marginHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                position: "relative",
                paddingTop: 15,
              }}
            >
              <ObiButton
                flavor="cancel"
                label="Disconnect All"
                onPress={async () => {
                  await Promise.all(
                    walletConnectStore.connectors.map(async ({ connector }) => {
                      await walletConnectStore.disconnect(connector);
                    })
                  );
                }}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
});

const ConnectedDapp = observer(function ConnectedDapp({
  dapp,
}: {
  dapp: WalletConnect;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: "#272727",
        marginBottom: 10,
        borderRadius: 10,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "600" }}>
        {dapp.peerMeta?.name}
      </Text>

      <InlineButton
        label="Disconnect"
        onPress={async () => {
          await dapp.killSession();
        }}
      />
    </View>
  );
});

const AppsScreen = observer(function AppsScreen() {
  const { configStore, appsStore } = useStore();
  const isObi = configStore.isObi();
  const isLoop = configStore.isLoop();
  const [editMode, setEditMode] = useState(false);
  const [url, setUrl] = useState("");
  const navigation = useRootNavigation();

  function onAppPress(app: App) {
    navigation.navigate(RootRoute.WebView, {
      app,
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <Card style={styles.card}>
        {editMode ? (
          <Button
            onPress={() => {
              setEditMode(false);
            }}
            title="Done"
          />
        ) : null}

        <ScrollView style={{ flex: 1 }}>
          <Tiles>
            <DefaultApps
              onAppPress={onAppPress}
              onLongPress={() => {
                setEditMode(true);
              }}
            />
            {appsStore.favorites.map((app) => {
              return (
                <Tile
                  onLongPress={() => {
                    setEditMode(true);
                  }}
                  key={app.url}
                  source={{ uri: app.icon ?? undefined }}
                  label={app.label}
                  onRemove={
                    editMode
                      ? () => {
                          appsStore.removeFavoriteByUrl(app.url);
                        }
                      : undefined
                  }
                  onPress={() => {
                    onAppPress(app);
                  }}
                />
              );
            })}
          </Tiles>
        </ScrollView>
      </Card>

      <View
        style={{
          marginHorizontal: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            marginBottom: 20,
            alignItems: "center",
            position: "relative",
            paddingVertical: 2,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: isLoop ? "#16152B" : "#272727",
            }}
          />
          <View
            style={{
              position: "absolute",
              margin: "auto",
              width: "100%",
            }}
          >
            {isLoop && (
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#090817",
                  alignSelf: "center",
                  alignItems: "center",
                  paddingHorizontal: 20,
                }}
              >
                <FontAwesomeIcon
                  icon={faPaperclip}
                  // @ts-expect-error web platform is not correctly handled by FontAwesomeIcon's types
                  size={Platform.OS === "web" ? "1x" : 24}
                  style={{ color: "#393853", marginRight: 6 }}
                />

                <View>
                  <Text style={{ color: "#787B9C" }}>GO TO SPECIFIC LINK</Text>
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 10,
                      marginBottom: 5,
                    }}
                  >
                    Some apps not yet supported
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: isLoop ? "#16152B" : "#272727",
              zIndex: -1,
            }}
          />
        </View>

        <View
          style={{
            backgroundColor: isLoop ? "#6959E6" : "transparent",
            borderColor: isLoop ? "transparent" : "white",
            borderWidth: 1,

            padding: 1,
            borderRadius: isLoop ? 12 : 32,
            flexDirection: "row",
          }}
        >
          <TextInput
            defaultValue=""
            style={{
              flex: 1,
              backgroundColor: isLoop ? "#090817" : "#1A1A1A",
              fontSize: 14,
              fontWeight: "500",
              borderRadius: isLoop ? 12 : 32,
              paddingLeft: 20,
              color: "#F6F5FF",
            }}
            placeholder="Go to URL"
            onChangeText={(text) => {
              const newText = text.includes("https://")
                ? text
                : `https://${text}`;
              setUrl(newText.toLocaleLowerCase());
            }}
            autoCapitalize="none"
          />
          <TouchableHighlight
            style={{
              width: 56,
              height: 56,
              justifyContent: "center",
              alignItems: "center",
            }}
            underlayColor="transparent"
            onPress={() => {
              //check if url is a valid url with protocol and domain
              try {
                const validURL = new URL(url.trim());
                //if validURL text has space
                if (
                  validURL.toString().includes(" ") ||
                  !validURL.toString().includes(".")
                ) {
                  // noinspection ExceptionCaughtLocallyJS
                  throw new Error("Invalid URL");
                }

                onAppPress({
                  url: validURL.href,
                  icon: "https://place-hold.it/180x180",
                  label: url,
                });
              } catch (error) {
                console.log(error);
                // Check if it has http:// or https:// and if so remove it
                const newUrl = url.includes("https://")
                  ? url.replace("https://", "")
                  : url.includes("http://")
                  ? url.replace("http://", "")
                  : url;

                const searchParam = newUrl.split(" ").join("+");
                const newSearchUrl = `https://www.google.com/search?q=${searchParam}`;
                onAppPress({
                  url: newSearchUrl,
                  label: newUrl,
                  icon: "https://place-hold.it/180x180",
                });
              }
            }}
          >
            {isObi ? (
              <View
                style={{
                  transform: [{ rotate: "180deg" }],
                }}
              >
                <ChevronCircleLeft />
              </View>
            ) : (
              <FontAwesomeIcon
                icon={faChevronRight}
                // @ts-expect-error web platform is not correctly handled by FontAwesomeIcon's types
                size={Platform.OS === "web" ? "1x" : 24}
                wa
                color="#fff"
              />
            )}
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
});

export const DefaultApps = observer(function DefaultApps({
  onAppPress,
  onLongPress,
}: {
  onAppPress: (app: App) => void;
  onLongPress: () => void;
}) {
  const { chainStore, configStore } = useStore();
  const wallet = useCurrentWallet();
  const intl = useIntl();

  const isTerra = isTerraChain(wallet.chainId);
  const isObi = configStore.isObi();

  return (
    <>
      <Tile
        onLongPress={onLongPress}
        source={isTerra ? require("./assets/terrascope.png") : HistoryIcon}
        label={intl.formatMessage({
          id: "apps.myhistory",
          defaultMessage: "History",
        })}
        onPress={() => {
          onAppPress({
            label: "History",
            url: chainStore.currentChainInformation.explorerUrl(wallet.address),
            icon: "https://place-hold.it/180x180",
          });
        }}
      />
      {isTerra ? (
        <Tile
          onLongPress={onLongPress}
          source={require("./assets/astroport.png")}
          label="Astroport"
          onPress={() => {
            onAppPress({
              label: "Astroport",
              url: "https://app.astroport.fi",
              icon: "https://place-hold.it/180x180",
            });
          }}
        />
      ) : null}
      {isObi ? (
        <Tile
          onLongPress={onLongPress}
          source={require("./assets/coinhall.png")}
          label="Coinhall"
          onPress={() => {
            onAppPress({
              label: "Coinhall",
              url: "https://coinhall.org",
              icon: "https://place-hold.it/180x180",
            });
          }}
        />
      ) : null}
      {isTerra ? (
        <Tile
          onLongPress={onLongPress}
          source={require("./assets/terra-poker.png")}
          label="Terra Poker"
          onPress={() => {
            onAppPress({
              label: "Terra Poker",
              url: "https://terrapoker.games",
              icon: "https://place-hold.it/180x180",
            });
          }}
        />
      ) : null}
    </>
  );
});
