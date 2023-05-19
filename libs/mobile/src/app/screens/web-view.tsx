import { useTheme } from "@emotion/react";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons/faEllipsis";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons/faRotateRight";
import { faShare } from "@fortawesome/free-solid-svg-icons/faShare";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  RootRoute,
  RootStackParamList,
  Text,
  useStore,
} from "@obi-wallet/common";
import { fetchMeta } from "@obi-wallet/common-deprecated";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { Share, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { ConnectedWebView } from "./components/connected-web-view";
import Fav from "./webview-assets/favorite-24px.svg";
import UnFav from "./webview-assets/unfavorite-24px.svg";

export type WebViewScreenProps = NativeStackScreenProps<
  RootStackParamList,
  RootRoute.WebView
>;

export const WebViewScreen = observer<WebViewScreenProps>(
  function WebViewScreen({ navigation, route }) {
    const { app } = route.params;
    const [currentUrl, setCurrentUrl] = useState(app.url);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(app.label);
    const webViewRef = useRef<WebView>(null);
    const theme = useTheme();
    const { configStore } = useStore();
    const isLoop = configStore.isLoop();
    const safeArea = useSafeAreaInsets();

    const bottomSheetRef = useRef<BottomSheet>(null);
    const triggerBottomSheet = (index: number) => {
      if (index === -1) {
        bottomSheetRef.current?.close();
      } else {
        bottomSheetRef.current?.snapToIndex(index);
      }
    };
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={{
            marginTop: safeArea.top,
            height: 40,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ paddingLeft: 10 }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <FontAwesomeIcon icon={faTimes} style={{ color: "white" }} />
          </TouchableOpacity>
          <View
            style={{
              paddingLeft: 20,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ color: "white", fontWeight: "bold" }}
            >
              {title}
            </Text>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => triggerBottomSheet(0)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <FontAwesomeIcon
                icon={faEllipsis}
                style={{
                  color: "white",
                  margin: 5,
                  transform: [{ rotate: "90deg" }],
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ConnectedWebView
          url={currentUrl}
          webViewRef={webViewRef}
          style={{ flex: 1, width: "100%", height: "100%" }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onNavigationStateChange={(e) => {
            setCurrentUrl(e.url);
            setTitle(e.title);
          }}
          loading={loading}
          setLoading={setLoading}
        />
        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: "white" }}
          backgroundStyle={{ backgroundColor: isLoop ? "#24243C" : "#1a1a1a" }}
          handleStyle={{ backgroundColor: "transparent" }}
          snapPoints={["25%"]}
          enablePanDownToClose={true}
          ref={bottomSheetRef}
          index={-1}
        >
          <BottomSheetView style={{ flex: 1, backgroundColor: "transparent" }}>
            <TouchableOpacity
              onPress={() => triggerBottomSheet(-1)}
              style={{
                alignSelf: "flex-end",
                marginRight: 10,
                marginBottom: 10,
              }}
            >
              <FontAwesomeIcon icon={faTimes} style={{ color: "white" }} />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <FavButton title={title} url={currentUrl} />
              <RefreshButton onPress={() => webViewRef.current?.reload()} />
              <ShareButton url={currentUrl} />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    );
  }
);

const FavButton = observer<{ title: string; url: string }>(function FavButton({
  title,
  url,
}) {
  const { appsStore, configStore } = useStore();
  const isLoop = configStore.isLoop();
  const isFavorite = appsStore.hasFavorite(url);

  return (
    <SheetButton
      onPress={async () => {
        if (isFavorite) {
          appsStore.removeFavoriteByUrl(url);
        } else {
          try {
            const { icon } = await fetchMeta(url);
            //
            // const res = await axios.get(app.url);
            // const html = res.data;
            // const root = await parse(html);
            // // get the page manifest
            // const manifest = root.querySelector('link[rel="manifest"]');
            // const manifestUrl = manifest?.attributes.href;
            // console.log({ manifestUrl });
            // //get host from currentUrl
            // const host = currentUrl.split("/")[2];
            // console.log({ host }, host + manifestUrl);
            // const manifestRes = await axios.get("https://" + host + manifestUrl);
            // console.log(manifestRes.data.icons);
            // //get the largest icon from manifestres.data.icons
            // const largestIcon = manifestRes.data.icons.sort(
            //   (a, b) => b.sizes.length - a.sizes.length
            // )[0];
            // // if largestIcon is an url keep it else compose it from host and largestIcon.src
            // const icon = largestIcon.src.startsWith("http")
            //   ? largestIcon.src
            //   : "https://" + host + largestIcon.src;

            const normalizedIcon = icon?.endsWith("/")
              ? icon.substr(0, icon.length - 1)
              : icon;

            appsStore.addFavorite({
              icon: normalizedIcon,
              label: title ?? url,
              url,
            });
          } catch (e) {
            console.log(e);
          }
        }
      }}
      IconComponent={
        isFavorite ? (
          <Fav width={24} height={24} fill={isLoop ? "black" : "white"} />
        ) : (
          <UnFav width={24} height={24} fill={isLoop ? "black" : "white"} />
        )
      }
      label={isFavorite ? "Remove" : "Add"}
    />
  );
});

export const RefreshButton = observer(function RefreshButton({
  onPress,
}: {
  onPress: () => void;
}) {
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();
  return (
    <SheetButton
      onPress={() => onPress()}
      IconComponent={
        <FontAwesomeIcon
          icon={faRotateRight}
          style={{ color: isLoop ? "black" : "white" }}
        />
      }
      label="Refresh"
    />
  );
});

export const ShareButton = observer(function ShareButton({
  url,
}: {
  url: string;
}) {
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: url,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (e) {
      const error = e as Error;
      alert(error.message);
    }
  };

  return (
    <SheetButton
      onPress={() => onShare()}
      IconComponent={
        <FontAwesomeIcon
          icon={faShare}
          style={{ color: isLoop ? "black" : "white" }}
        />
      }
      label="Share"
    />
  );
});

export const SheetButton = observer(function SheetButton({
  onPress,
  IconComponent,
  label,
}: {
  onPress: () => void;
  IconComponent: JSX.Element;
  label: string;
}) {
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();
  return (
    <View style={{ justifyContent: "center", alignItems: "center", width: 60 }}>
      <TouchableOpacity
        onPress={() => onPress()}
        style={{
          height: 50,
          width: 50,
          backgroundColor: isLoop ? "gray" : "#437DFF",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 12,
        }}
      >
        {IconComponent}
      </TouchableOpacity>
      <Text style={{ marginTop: 5, color: "white", opacity: 0.6 }}>
        {label}
      </Text>
    </View>
  );
});
