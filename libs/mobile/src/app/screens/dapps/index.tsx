import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons/faPaperclip";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  App,
  Card,
  isCosmosSinglesigWallet,
  RootStore,
  Text,
  Tile,
  TextInput,
  Tiles,
  isAnyTerraMultisigWallet,
} from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { FC, useState } from "react";
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
import { SvgProps } from "react-native-svg";

import ChevronCircleRight from "./assets/chevron_circle_right.svg";
const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: "space-between",
  },
});

export interface DappProps {
  rootStore: RootStore;
  onAppPress: (app: App) => void;
  marginBottom?: number;
  icons: FC<SvgProps>[];
}

export const Dapps = observer<DappProps>(
  ({ onAppPress, marginBottom, rootStore, icons }) => {
    const [
      BuyCryptoIcon,
      CosmicPartyIcon,
      GetTicketsIcon,
      MyTicketsIcon,
      HistoryIcon,
      UniSwapIcon,
      OpenseaIcon,
      AmazonIcon,
    ] = icons;
    const { appsStore, configStore, walletsStore } = rootStore;
    const isObi = configStore.isObi();
    const isLoop = configStore.isLoop();
    const [editMode, setEditMode] = useState(false);
    const [url, setUrl] = useState("");
    const intl = useIntl();

    return (
      <SafeAreaView
        style={{
          flex: 1,
          marginBottom,
        }}
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
              {appsStore.favorites.map((app: any) => {
                return (
                  <Tile
                    onLongPress={() => {
                      setEditMode(true);
                    }}
                    key={app.url}
                    imgUrl={app.icon}
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
              {/*<Tile*/}
              {/*  onLongPress={() => {*/}
              {/*    setEditMode(true);*/}
              {/*  }}*/}
              {/*  ImgComponent={BuyCryptoIcon}*/}
              {/*  label={intl.formatMessage({*/}
              {/*    id: "apps.kado",*/}
              {/*    defaultMessage: "Buy with Card",*/}
              {/*  })}*/}
              {/*  onPress={() => {*/}
              {/*    onAppPress({*/}
              {/*      label: "Buy with Card",*/}
              {/*      url: `https://app.kado.money?network=JUNO&onToAddress=${walletsStore.address}&apiKey=0a5fc82b-be15-4059-8edf-9ff9c54186ce`,*/}
              {/*      icon: "https://place-hold.it/180x180",*/}
              {/*    });*/}
              {/*  }}*/}
              {/*/>*/}
              {/*{!isObi && (*/}
              {/*  <Tile*/}
              {/*    onLongPress={() => {*/}
              {/*      setEditMode(true);*/}
              {/*    }}*/}
              {/*    ImgComponent={CosmicPartyIcon}*/}
              {/*    label="Cosmic 5 Party"*/}
              {/*    onPress={() => {*/}
              {/*      onAppPress({*/}
              {/*        label: "Cosmic 5 Party",*/}
              {/*        url: `https://events.loop.markets`,*/}
              {/*        icon: "https://place-hold.it/180x180",*/}
              {/*      });*/}
              {/*    }}*/}
              {/*  />*/}
              {/*)}*/}
              {/*<Tile*/}
              {/*  onLongPress={() => {*/}
              {/*    setEditMode(true);*/}
              {/*  }}*/}
              {/*  ImgComponent={GetTicketsIcon}*/}
              {/*  label={intl.formatMessage({*/}
              {/*    id: "apps.gettickets",*/}
              {/*    defaultMessage: "Get Tickets",*/}
              {/*  })}*/}
              {/*  onPress={() => {*/}
              {/*    onAppPress({*/}
              {/*      label: "Get Tickets",*/}
              {/*      url: `https://nft-juno-dev.loop.do/webapp/tickets`,*/}
              {/*      icon: "https://place-hold.it/180x180",*/}
              {/*    });*/}
              {/*  }}*/}
              {/*/>*/}
              {/*<Tile*/}
              {/*  onLongPress={() => {*/}
              {/*    setEditMode(true);*/}
              {/*  }}*/}
              {/*  ImgComponent={MyTicketsIcon}*/}
              {/*  label={intl.formatMessage({*/}
              {/*    id: "apps.mytickets",*/}
              {/*    defaultMessage: "My Tickets",*/}
              {/*  })}*/}
              {/*  onPress={() => {*/}
              {/*    onAppPress({*/}
              {/*      label: "My Tickets",*/}
              {/*      url: `https://nft-juno-dev.loop.do/webapp/mytickets`,*/}
              {/*      icon: "https://place-hold.it/180x180",*/}
              {/*    });*/}
              {/*  }}*/}
              {/*/>*/}
              <Tile
                onLongPress={() => {
                  setEditMode(true);
                }}
                ImgComponent={
                  isAnyTerraMultisigWallet(walletsStore.currentWallet)
                    ? HistoryIcon
                    : undefined
                }
                source={
                  isAnyTerraMultisigWallet(walletsStore.currentWallet)
                    ? require("./assets/terrascope.png")
                    : undefined
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
                <>
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
                  {/*<Tile*/}
                  {/*  onLongPress={() => {*/}
                  {/*    setEditMode(true);*/}
                  {/*  }}*/}
                  {/*  key="amazon"*/}
                  {/*  ImgComponent={AmazonIcon}*/}
                  {/*  label="Amazon"*/}
                  {/*  onPress={() => {*/}
                  {/*    onAppPress({*/}
                  {/*      label: "Amazon",*/}
                  {/*      url: "https://amazon.com",*/}
                  {/*      icon: "https://place-hold.it/180x180",*/}
                  {/*    });*/}
                  {/*  }}*/}
                  {/*/>*/}
                  {/*<Tile*/}
                  {/*  onLongPress={() => {*/}
                  {/*    setEditMode(true);*/}
                  {/*  }}*/}
                  {/*  key="opensea"*/}
                  {/*  ImgComponent={OpenseaIcon}*/}
                  {/*  label="OpenSea"*/}
                  {/*  onPress={() => {*/}
                  {/*    onAppPress({*/}
                  {/*      label: "History",*/}
                  {/*      url: "https://opensea.io",*/}
                  {/*      icon: "https://place-hold.it/180x180",*/}
                  {/*    });*/}
                  {/*  }}*/}
                  {/*/>*/}
                </>
              ) : null}
            </Tiles>
          </ScrollView>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ paddingVertical: 10 }}
            keyboardVerticalOffset={100}
          >
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
                  style={{ flex: 1, height: 1, backgroundColor: "#16152B" }}
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
                    backgroundColor: "#16152B",
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
                      //check if it has http:// or https:// and if so remove it
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
                      <ChevronCircleRight />
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
        </Card>
      </SafeAreaView>
    );
  }
);
