import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { Image, SafeAreaView, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { useStore } from "../..";
import { LanguagePicker } from "../../app/language-picker";
import { InitialBackground } from "../../app/screens/components/initial-background";
import { BrandToggle } from "../../app/screens/components/obi-mode-toggle";
import { isSmallScreenNumber } from "../../app/screens/components/screen-size";

export interface WelcomeLayoutProps {
  title: string;
  subTitle: string;
  children: ReactNode;
}

export const WelcomeLayout = observer<WelcomeLayoutProps>(
  function WelcomeLayout({ title, subTitle, children }) {
    const { configStore } = useStore();
    const isObi = configStore.isObi();

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
              top: 40,
              left: 0,
              right: 0,
              marginBottom: 10,
            }}
          >
            <View style={{ padding: 10, marginBottom: 10 }}>
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
                  color: "white",
                  fontSize: isSmallScreenNumber(12, 14),
                }}
              >
                <Text style={{ fontWeight: "600" }}>
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
            <View style={{ marginHorizontal: 20 }}>
              {isObi ? null : <LanguagePicker />}
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 10,
              zIndex: -1,
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
                      width: "70%",
                      height: "70%",
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
                style={{ marginBottom: 10, zIndex: 2, alignItems: "flex-end" }}
              >
                <LanguagePicker />
              </View>
            ) : null}

            <Text
              style={{
                color: "#F6F5FF",
                fontSize: isSmallScreenNumber(30, 32),
                fontWeight: "600",
                marginTop: isSmallScreenNumber(25, 40),
                textAlign: "left",
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: isObi ? "white" : "#999CB6",
                fontSize: isSmallScreenNumber(12, 16),
                fontWeight: "400",
                marginTop: 12,
                textAlign: isObi ? "justify" : "left",
              }}
            >
              {subTitle}
            </Text>
          </View>
          <View style={{ width: "100%", flex: 1, paddingHorizontal: 15 }}>
            <ScrollView style={{}}>{children}</ScrollView>
          </View>
        </SafeAreaView>
      </InitialBackground>
    );
  }
);
