import { useTheme } from "@emotion/react";
import { isSmallScreen } from "@obi-wallet/common";
import { Text } from "@obi-wallet/common-deprecated";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { Image, SafeAreaView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStore } from "../..";
import { LanguagePicker } from "../../app/language-picker";
import { InitialBackground } from "../../app/screens/components/initial-background";
import { BrandToggle } from "../../app/screens/components/obi-mode-toggle";

export interface WelcomeLayoutProps {
  title: string;
  subTitle: string;
  children: ReactNode;
}

export const WelcomeLayout = observer<WelcomeLayoutProps>(
  function WelcomeLayout({ title, subTitle, children }) {
    const { configStore } = useStore();
    const safeArea = useSafeAreaInsets();
    const isObi = configStore.isObi();
    const theme = useTheme();

    return (
      <InitialBackground>
        <SafeAreaView
          style={{
            flex: 1,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: safeArea.top,
              left: 0,
              right: 0,
            }}
          >
            <View style={{ padding: theme.spacing["12"] }}>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                  backgroundColor: "black",
                  opacity: 0.3,
                }}
              />
              <Text
                style={{
                  ...theme.typography.footnote,
                  color: "white",
                }}
              >
                <Text style={{ fontWeight: theme.fontWeights.bold }}>
                  <FormattedMessage
                    id="onboarding1.disclaimer"
                    defaultMessage="Disclaimer:"
                  />{" "}
                </Text>
                <FormattedMessage
                  id="onboarding1.disclaimerMsg"
                  defaultMessage="Obi is in alpha. Security audits are pending. Current implementations are only intended for trial purposes."
                />
              </Text>
            </View>
            <View style={{ marginHorizontal: theme.spacing["24"] }}>
              {isObi ? null : <LanguagePicker />}
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: theme.spacing["16"],
              zIndex: -1,
              flex: 2,
              justifyContent: "flex-end",
            }}
          >
            <BrandToggle>
              <View
                style={{
                  aspectRatio: 1,
                  alignItems: isObi ? "center" : "flex-start",
                  justifyContent: "flex-end",
                }}
              >
                {isObi ? (
                  <Image
                    source={require("../../app/screens/onboarding/welcome/assets/obi-wallet-icon.png")}
                    resizeMode="contain"
                    style={{
                      width: isSmallScreen() ? "50%" : "70%",
                      height: isSmallScreen() ? "50%" : "70%",
                      aspectRatio: 1 / 1,
                    }}
                  />
                ) : (
                  <Image
                    source={require("../../app/screens/onboarding/welcome/assets/loop.png")}
                  />
                )}
              </View>
            </BrandToggle>
            {isObi ? (
              <View
                style={{
                  marginBottom: theme.spacing["12"],
                  zIndex: 2,
                }}
              >
                <LanguagePicker />
              </View>
            ) : null}

            <Text
              style={{
                ...theme.typography.largeTitle,
                color: "#F6F5FF",
                marginTop: theme.spacing["24"],
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                ...theme.typography.subhead,
                color: isObi ? "white" : "#999CB6",
                fontWeight: "400",
                marginTop: theme.spacing["12"],
                textAlign: isObi ? "justify" : "left",
              }}
            >
              {subTitle}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              paddingHorizontal: theme.spacing["16"],
              marginTop: theme.spacing["12"],
            }}
          >
            {children}
          </View>
        </SafeAreaView>
      </InitialBackground>
    );
  }
);
