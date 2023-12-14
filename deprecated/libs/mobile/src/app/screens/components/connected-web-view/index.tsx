import { RefreshControl, useStore } from "@obi-wallet/common";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import EventEmitter from "eventemitter3";
import { observer } from "mobx-react-lite";
import { RefObject, useCallback, useMemo } from "react";
import { ScrollView } from "react-native";
import {
  WebView,
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";

const tryNewURL = (str: string): URL | undefined => {
  try {
    return new URL(str);
  } catch {
    return undefined;
  }
};

export const parseDynamicLinkURL = (value: string): URL | undefined => {
  const url = tryNewURL(value);
  const link = url?.searchParams.get("link");
  if (link) return tryNewURL(link);
  return undefined;
};

export interface ConnectedWebViewProps extends Omit<WebViewProps, "source"> {
  url: string;
  webViewRef: RefObject<WebView>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const ConnectedWebView = observer(function ConnectedWebView({
  url,
  webViewRef,
  loading,
  setLoading,
  ...props
}: ConnectedWebViewProps) {
  const { walletConnectStore } = useStore();
  const wallet = useCurrentWallet();

  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      eventEmitter.emit("message", event.nativeEvent);
    },
    [eventEmitter],
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#17162C" }}
      contentContainerStyle={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => {
            webViewRef.current?.reload();
            setLoading(true);
          }}
        />
      }
    >
      <WebView
        {...props}
        originWhitelist={["*"]}
        source={{ uri: url }}
        onMessage={onMessage}
        onShouldStartLoadWithRequest={(e) => {
          if (e.url.startsWith("terrastation://")) {
            return false;
          }
          if (e.url.startsWith("https://terrastation.page.link")) {
            const payload = parseDynamicLinkURL(e.url)?.searchParams.get(
              "payload",
            );
            if (payload) {
              void walletConnectStore.connect({
                uri: payload,
                walletMeta: wallet.meta,
              });
            }
            return false;
          }
          return true;
        }}
        ref={webViewRef}
      />
    </ScrollView>
  );
});
