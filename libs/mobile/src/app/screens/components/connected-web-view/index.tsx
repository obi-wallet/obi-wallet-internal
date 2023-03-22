import EventEmitter from "eventemitter3";
import { observer } from "mobx-react-lite";
import { RefObject, useCallback, useEffect, useMemo } from "react";
import { ScrollView } from "react-native";
import {
  WebView,
  WebViewMessageEvent,
  WebViewProps,
} from "react-native-webview";

import { useKeplr } from "../../../injected-provider";
import { bundle } from "../../../injected-provider/bundle";
import { RNInjectedKeplr } from "../../../injected-provider/injected-keplr";
import { useMultisigWallet, useStore } from "../../../stores";
import { RefreshControl } from "../refresh-control";

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
  const wallet = useMultisigWallet();
  const keplr = useKeplr({ url });
  const code = bundle;

  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      eventEmitter.emit("message", event.nativeEvent);
    },
    [eventEmitter]
  );
  useEffect(() => {
    RNInjectedKeplr.startProxy(
      keplr,
      {
        addMessageListener: (fn) => {
          eventEmitter.addListener("message", fn);
        },
        postMessage: (message) => {
          webViewRef.current?.injectJavaScript(
            `
                window.postMessage(${JSON.stringify(
                  message
                )}, window.location.origin);
                true; // note: this is required, or you'll sometimes get silent failures
              `
          );
        },
      },
      RNInjectedKeplr.parseWebviewMessage
    );
  }, [eventEmitter, keplr, webViewRef]);

  if (!code) return null;

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
        injectedJavaScriptBeforeContentLoaded={code}
        onMessage={onMessage}
        onShouldStartLoadWithRequest={(e) => {
          if (e.url.startsWith("terrastation://")) {
            return false;
          }
          if (e.url.startsWith("https://terrastation.page.link")) {
            const payload = parseDynamicLinkURL(e.url)?.searchParams.get(
              "payload"
            );
            if (payload) {
              void walletConnectStore.addConnector({
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
