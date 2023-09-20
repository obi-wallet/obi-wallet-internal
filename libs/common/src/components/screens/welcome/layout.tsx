import { useTheme } from "@emotion/react";
import { ImagePosition } from "@obi-wallet/theme";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { Image, SafeAreaView, View } from "react-native";

import { LanguagePicker } from "../../language-picker";
import { OsmosisScreenContainer } from "../../osmosis-screen-container";
import { Text } from "../../typography";

export interface WelcomeLayoutProps {
  title: string;
  subTitle: string;
  children: ReactNode;
}

export const WelcomeLayout = observer<WelcomeLayoutProps>(
  function WelcomeLayout({ title, subTitle, children }) {
    const theme = useTheme();

    const getImagePosition = () => {
      switch (theme.welcome?.imagePosition) {
        case ImagePosition.Top:
          return "flex-start";
        case ImagePosition.Center:
          return "center";
        case ImagePosition.Bottom:
        default:
          return "flex-end";
      }
    };

    const getImageSize = () => {
      return "100%";
      const buttons = theme.welcome?.buttons?.length;
      return buttons && buttons >= 3 ? "80%" : "60%";
    };
    console.log(theme.welcome.subtitleStyles);
    return (
      <OsmosisScreenContainer
        hideLogo={theme.welcome?.hideHeaderLogo}
        backgroundStyle={theme.welcome?.background}
      >
        <SafeAreaView
          style={{
            flex: 1,
            ...(theme.welcome?.horizontalSpacing
              ? { paddingHorizontal: theme.welcome?.horizontalSpacing }
              : {}),
          }}
        >
          {/*<View*/}
          {/*  style={{*/}
          {/*    position: "absolute",*/}
          {/*    top: safeArea.top,*/}
          {/*    left: 0,*/}
          {/*    right: 0,*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <View style={{ padding: theme.spacing["12"] }}>*/}
          {/*    <View*/}
          {/*      style={{*/}
          {/*        position: "absolute",*/}
          {/*        top: 0,*/}
          {/*        right: 0,*/}
          {/*        left: 0,*/}
          {/*        bottom: 0,*/}
          {/*        backgroundColor: "black",*/}
          {/*        opacity: 0.3,*/}
          {/*      }}*/}
          {/*    />*/}
          {/*    <Text*/}
          {/*      style={{*/}
          {/*        ...theme.typography.footnote,*/}
          {/*        color: "white",*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      <Text style={{ fontWeight: theme.fontWeights.bold }}>*/}
          {/*        <FormattedMessage*/}
          {/*          id="onboarding1.disclaimer"*/}
          {/*          defaultMessage="Disclaimer:"*/}
          {/*        />{" "}*/}
          {/*      </Text>*/}
          {/*      <FormattedMessage*/}
          {/*        id="onboarding1.disclaimerMsg"*/}
          {/*        defaultMessage="Obi is in alpha. Security audits are pending. Current implementations are only intended for trial purposes."*/}
          {/*      />*/}
          {/*    </Text>*/}
          {/*  </View>*/}
          {/*  <View style={{ marginHorizontal: theme.spacing["24"] }}>*/}
          {/*    {isObi ? null : <LanguagePicker />}*/}
          {/*  </View>*/}
          {/*</View>*/}

          <View
            style={{
              // paddingHorizontal: theme.spacing["16"],
              zIndex: -1,
              flex: 1,

              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: getImagePosition(),
              }}
            >
              {/* TODO: modal: fix images for web */}
              {/*{isObi ? (*/}
              {/*  <Image*/}
              {/*    source={require("../../app/screens/onboarding/welcome/assets/obi-wallet-icon.png")}*/}
              {/*    resizeMode="contain"*/}
              {/*    style={{*/}
              {/*      width: isSmallScreen() ? "50%" : "70%",*/}
              {/*      height: isSmallScreen() ? "50%" : "70%",*/}
              {/*      aspectRatio: 1 / 1,*/}
              {/*    }}*/}
              {/*  />*/}
              {/*) : (*/}
              {/*  <Image*/}
              {/*    source={require("../../app/screens/onboarding/welcome/assets/loop.png")}*/}
              {/*  />*/}
              {/*)}*/}

              {theme.welcome?.image ? (
                <Image
                  source={{ uri: theme.welcome.image }}
                  resizeMode="contain"
                  style={{
                    height: getImageSize(),
                    width: getImageSize(),

                    // aspectRatio: 1,
                  }}
                />
              ) : null}
            </View>
            <View
              style={{
                marginBottom: theme.spacing["12"],
                zIndex: 2,
              }}
            >
              <LanguagePicker />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  ...theme.typography.largeTitle,
                  color: "#F6F5FF",
                  marginTop: theme.spacing["24"],
                  ...theme.welcome?.titleStyles,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  ...theme.typography.subhead,
                  color: "white",
                  fontWeight: "400",
                  marginTop: theme.spacing["12"],
                  textAlign: "left",
                  ...theme.welcome?.subtitleStyles,
                }}
              >
                {subTitle}
              </Text>
            </View>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              paddingHorizontal: theme.spacing["16"],
              marginTop: theme.spacing["12"],
              paddingBottom: theme.spacing["16"],
              ...theme.buttonsContainerStyle,
            }}
          >
            {children}
          </View>
        </SafeAreaView>
      </OsmosisScreenContainer>
    );
  },
);
