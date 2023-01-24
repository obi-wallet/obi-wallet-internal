import { useTheme } from "@emotion/react";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { height } from "@fortawesome/free-solid-svg-icons/faPaperPlane";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons/faPaperclip";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  App,
  Card,
  isAnyTerraMultisigWallet,
  isCosmosSinglesigWallet,
  Text,
  TextInput,
  Tile,
  Tiles,
} from "@obi-wallet/common";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RootRoute, useRootNavigation } from "../../root-stack";
import { useStore } from "../../stores";
import ChevronCircleLeft from "./assets/chevron-circle-left.svg";
import HistoryIcon from "./assets/history.svg";

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
  },
});

export const DappExplorer = observer(() => {
  const rootStore = useStore();
  const navigation = useRootNavigation();
  const safeArea = useSafeAreaInsets();
  const theme = useTheme();

  const { appsStore, configStore, walletsStore } = rootStore;
  const isObi = configStore.isObi();
  const isLoop = configStore.isLoop();
  const [editMode, setEditMode] = useState(false);
  const [url, setUrl] = useState("");
  const intl = useIntl();

  function onAppPress(app: App) {
    navigation.navigate(RootRoute.WebView, {
      app,
    });
  }

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
              <Tile
                onLongPress={() => {
                  setEditMode(true);
                }}
                source={
                  isAnyTerraMultisigWallet(walletsStore.currentWallet)
                    ? require("./assets/terrascope.png")
                    : HistoryIcon
                }
                label={intl.formatMessage({
                  id: "apps.myhistory",
                  defaultMessage: "History",
                })}
                onPress={() => {
                  onAppPress({
                    label: "History",
                    url: isAnyTerraMultisigWallet(walletsStore.currentWallet)
                      ? `https://terrasco.pe/mainnet/contract/${walletsStore.address}`
                      : isCosmosSinglesigWallet(walletsStore.currentWallet)
                      ? `https://mintscan.io/juno/account/${walletsStore.address}`
                      : `https://mintscan.io/juno/wasm/contract/${walletsStore.address}`,
                    icon: "https://place-hold.it/180x180",
                  });
                }}
              />
              {isObi ? (
                <Tile
                  onLongPress={() => {
                    setEditMode(true);
                  }}
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
                    // @ts-expect-error
                    size={Platform.OS === "web" ? "1x" : 24}
                    style={{ color: "#393853", marginRight: 6 }}
                  />

                  <View>
                    <Text style={{ color: "#787B9C" }}>
                      GO TO SPECIFIC LINK
                    </Text>
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
                  // @ts-expect-error
                  size={Platform.OS === "web" ? "1x" : 24}
                  color="#fff"
                />
              )}
            </TouchableHighlight>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});
