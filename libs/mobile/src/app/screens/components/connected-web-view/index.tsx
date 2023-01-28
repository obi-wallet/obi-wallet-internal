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
import { useStore } from "../../../stores";
import { RefreshControl } from "../refresh-control";

export interface ConnectedWebViewProps extends Omit<WebViewProps, "source"> {
  url: string;
  webViewRef: RefObject<WebView>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const tryNewURL = (str: string): URL | undefined => {
  try {
    return new URL(str);
  } catch {
    return undefined;
  }
};

const parseDynamicLinkURL = (value: string): URL | undefined => {
  const url = tryNewURL(value);
  const link = url?.searchParams.get("link");
  if (link) return tryNewURL(link);
  return undefined;
};

export const ConnectedWebView = observer(
  ({
    url,
    webViewRef,
    loading,
    setLoading,
    ...props
  }: ConnectedWebViewProps) => {
    const { walletConnectStore } = useStore();
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

    const { permissionStore } = useStore();

    useEffect(() => {
      for (const data of permissionStore.waitingDatas) {
        console.log("trying to approve");
        permissionStore.approve(data.id);
        console.log("approved");
      }
    }, [permissionStore, permissionStore.waitingDatas]);

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
              // terrastation://walletconnect_confirm/?action=walletconnect_confirm&payload=
              // TODO: dummy payload:
              // eyJpZCI6MTY3NDg4MTg0NDk1NSwiaGFuZHNoYWtlVG9waWMiOiIwNzA3YzdlMS05ZjhmLTQyOGItYTQ0YS1iYjRmNGM4ZWEzODUiLCJtZXRob2QiOiJwb3N0IiwicGFyYW1zIjp7Im1zZ3MiOlsie1wiQHR5cGVcIjpcIi9jb3Ntd2FzbS53YXNtLnYxLk1zZ0V4ZWN1dGVDb250cmFjdFwiLFwiY29udHJhY3RcIjpcInRlcnJhMWUzbnFyOHZ3dTMycHpnYXNyYXVkOWF2cHdkZDhwaG1xZ3JlNWtwd2x5dGdlZGoyZW1ra3EzbDY3aHlcIixcImZ1bmRzXCI6W3tcImFtb3VudFwiOlwiMTAwMFwiLFwiZGVub21cIjpcInVsdW5hXCJ9XSxcIm1zZ1wiOntcImV4ZWN1dGVfcm91dGVzXCI6e1wiZXhwZWN0ZWRfcmVjZWl2ZVwiOlwiMjQyMVwiLFwibWluaW11bV9yZWNlaXZlXCI6XCIyNDA5XCIsXCJvZmZlcl9hbW91bnRcIjpcIjEwMDBcIixcIm9mZmVyX2Fzc2V0XCI6e1wibmF0aXZlX3Rva2VuXCI6e1wiZGVub21cIjpcInVsdW5hXCJ9fSxcInJldHVybl9hc3NldFwiOlwiaWJjL0IzNTA0RTA5MjQ1NkJBNjE4Q0MyOEFDNjcxQTcxRkIwOEM2Q0EwRkQwQkU3QzhBNUI1QTNFMkREOTMzQ0M5RTRcIixcInJvdXRlc1wiOlt7XCJvZmZlcl9hbW91bnRcIjpcIjEwMDBcIixcInN3YXBfb3BzXCI6W3tcIm9mZmVyX2Fzc2V0XCI6e1wibmF0aXZlX3Rva2VuXCI6e1wiZGVub21cIjpcInVsdW5hXCJ9fSxcInBhaXJfYWRkcmVzc1wiOlwidGVycmExc3hkcm41ZWZqdWYzejJsenV3bmV3ODM5enVzNGxtMmRuZHd6dzU4OXQwa3prdTZrbWhuc3Voc3hxM1wifSx7XCJvZmZlcl9hc3NldFwiOntcInRva2VuXCI6e1wiY29udHJhY3RfYWRkclwiOlwidGVycmExNmg3a2VkczI2ZDUyeGo4cm45amZ4NmxqMngwamE3OWx0NTZ5eG5tbG00eHN0dGY1bXU1c21xNWY3OFwifX0sXCJwYWlyX2FkZHJlc3NcIjpcInRlcnJhMWhhcGFudDl6OTQ1NHMwc2wycGp3cGN0MmFwZnQ0dXh1NnlwZW0wdTI5MGZlMDYyNmd2enFnNHh6bHBcIn0se1wib2ZmZXJfYXNzZXRcIjp7XCJ0b2tlblwiOntcImNvbnRyYWN0X2FkZHJcIjpcInRlcnJhMXJ3ZzVrdDZrY3l4dHo2OWFjamdwZXV0N2RncjR5M3I3dHZudGR4cXQwM2R2cHFrdHJmeHE0anJ2cHFcIn19LFwicGFpcl9hZGRyZXNzXCI6XCJ0ZXJyYTEwOHBzejR4YWRncHl0dTc2ZGZ6dGF5dGtsZHZyaDZ6bDM1bndkeTZuMmNsdHZuMGRrdDhxdTI2cmRlXCJ9XX1dfX0sXCJzZW5kZXJcIjpcInRlcnJhMXl4NGNhZHgweGtrdDdxbjRjY25nc2VmMjRqZjVwZnVxd3Y2a2t1bDVuZGpoaHg0ZHdkZXN0cW1oMGZcIn0iXSwiZmVlIjoie1wiYW1vdW50XCI6W3tcImFtb3VudFwiOlwiMzUwMzhcIixcImRlbm9tXCI6XCJ1bHVuYVwifV0sXCJnYXNfbGltaXRcIjpcIjIzMzU4NTRcIixcImdyYW50ZXJcIjpcIlwiLFwicGF5ZXJcIjpcIlwifSJ9fQ==
              // {"id":1674881844955,"handshakeTopic":"0707c7e1-9f8f-428b-a44a-bb4f4c8ea385","method":"post","params":{"msgs":["{\"@type\":\"/cosmwasm.wasm.v1.MsgExecuteContract\",\"contract\":\"terra1e3nqr8vwu32pzgasraud9avpwdd8phmqgre5kpwlytgedj2emkkq3l67hy\",\"funds\":[{\"amount\":\"1000\",\"denom\":\"uluna\"}],\"msg\":{\"execute_routes\":{\"expected_receive\":\"2421\",\"minimum_receive\":\"2409\",\"offer_amount\":\"1000\",\"offer_asset\":{\"native_token\":{\"denom\":\"uluna\"}},\"return_asset\":\"ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4\",\"routes\":[{\"offer_amount\":\"1000\",\"swap_ops\":[{\"offer_asset\":{\"native_token\":{\"denom\":\"uluna\"}},\"pair_address\":\"terra1sxdrn5efjuf3z2lzuwnew839zus4lm2dndwzw589t0kzku6kmhnsuhsxq3\"},{\"offer_asset\":{\"token\":{\"contract_addr\":\"terra16h7keds26d52xj8rn9jfx6lj2x0ja79lt56yxnmlm4xsttf5mu5smq5f78\"}},\"pair_address\":\"terra1hapant9z9454s0sl2pjwpct2apft4uxu6ypem0u290fe0626gvzqg4xzlp\"},{\"offer_asset\":{\"token\":{\"contract_addr\":\"terra1rwg5kt6kcyxtz69acjgpeut7dgr4y3r7tvntdxqt03dvpqktrfxq4jrvpq\"}},\"pair_address\":\"terra108psz4xadgpytu76dfztaytkldvrh6zl35nwdy6n2cltvn0dkt8qu26rde\"}]}]}},\"sender\":\"terra1yx4cadx0xkkt7qn4ccngsef24jf5pfuqwv6kkul5ndjhhx4dwdestqmh0f\"}"],"fee":"{\"amount\":[{\"amount\":\"35038\",\"denom\":\"uluna\"}],\"gas_limit\":\"2335854\",\"granter\":\"\",\"payer\":\"\"}"}}

              console.log(e.url);
              return false;
            }
            if (e.url.startsWith("https://terrastation.page.link")) {
              const payload = parseDynamicLinkURL(e.url)?.searchParams.get(
                "payload"
              );
              if (payload) {
                void walletConnectStore.addConnector(payload);
              }
              return false;
            }
            return true;
          }}
          ref={webViewRef}
        />
      </ScrollView>
    );
  }
);
