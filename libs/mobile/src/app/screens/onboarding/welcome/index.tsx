import {
  Feature,
  isAnyMultisigWallet,
  isMultisigDemoWallet,
  MultisigKey,
  Text,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, Image, SafeAreaView, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Button } from "../../../button";
import { LanguagePicker } from "../../../language-picker";
import { useStore } from "../../../stores";
import {
  AccountPickerModal,
  useAccountPickerModalProps,
} from "../../account-picker-modal";
import { InitialBackground } from "../../components/initial-background";
import { BrandToggle } from "../../components/obi-mode-toggle";
import { isSmallScreenNumber } from "../../components/screen-size";
import { OnboardingRoute, OnboardingStackParamList } from "../onboarding-stack";
import GetStarted from "./assets/get-started.svg";

export type WelcomeProps = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.Welcome
>;

export const Welcome = observer<WelcomeProps>(({ navigation }) => {
  const { configStore, walletsStore } = useStore();
  const isObi = configStore.isObi();
  const wallet = walletsStore.currentWallet;
  const multisigWallet = isAnyMultisigWallet(wallet) ? wallet : null;
  const intl = useIntl();

  const isInRecovery =
    isAnyMultisigWallet(wallet) && wallet.keyInRecovery !== null;

  const accountPickerModalProps = useAccountPickerModalProps();

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
              style={{ color: "white", fontSize: isSmallScreenNumber(12, 14) }}
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
            <LanguagePicker />
          </View>
        </View>
        <AccountPickerModal {...accountPickerModalProps} />

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
                  source={require("./assets/obi-wallet-icon.png")}
                  resizeMode="contain"
                  style={{
                    width: "70%",
                    height: "70%",
                    aspectRatio: 1 / 1,
                  }}
                />
              ) : (
                <Image source={require("./assets/loop.png")} />
              )}
            </View>
          </BrandToggle>
          {/* {isObi ? (
            <View
              style={{ marginBottom: 10, zIndex: 2, alignItems: "flex-end" }}
            >
              <LanguagePicker />
            </View>
          ) : null} */}

          <Text
            style={{
              color: "#F6F5FF",
              fontSize: isSmallScreenNumber(25, 32),
              fontWeight: "600",
              marginTop: isSmallScreenNumber(25, 40),
              textAlign: isObi ? "center" : "left",
            }}
          >
            {renderTitle()}
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
            {renderSubTitle()}
          </Text>
        </View>
        <View style={{ width: "100%", flex: 1, paddingHorizontal: 15 }}>
          <ScrollView style={{}}>
            {renderContinueButton(multisigWallet?.keyInRecovery)}
            {isInRecovery ||
            !configStore.isFeatureEnabled(Feature.Recovery) ? null : (
              <Button
                label={intl.formatMessage({ id: "onboarding1.recoverwallet" })}
                RightIcon={isObi ? undefined : GetStarted}
                flavor="blue"
                style={{
                  marginTop: 20,
                }}
                onPress={() => {
                  Alert.alert(
                    "Recover Existing Wallet",
                    "Only use this if you have made a wallet using the Loop app before.",
                    [
                      {
                        text: "Cancel",
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        onPress() {},
                      },
                      {
                        text: "Continue",
                        async onPress() {
                          const wallet = await (async () => {
                            if (
                              multisigWallet &&
                              multisigWallet.type ===
                                configStore.getDefaultMultisigWalletType()
                            ) {
                              return multisigWallet;
                            }

                            return await walletsStore.addMultisigWallet();
                          })();
                          await wallet.cancelRecovery();
                          wallet.recover("biometrics");
                          navigation.navigate(
                            OnboardingRoute.CreateMultisigBiometrics
                          );
                        },
                      },
                    ]
                  );
                }}
              />
            )}
            {isInRecovery ? (
              <Button
                label={intl.formatMessage({ id: "general.cancel" })}
                RightIcon={isObi ? undefined : GetStarted}
                flavor="blue"
                style={{
                  marginTop: 20,
                }}
                onPress={async () => {
                  await multisigWallet?.cancelRecovery();
                }}
              />
            ) : configStore.isFeatureEnabled(Feature.SinglesigWallets) ? (
              <Button
                label={intl.formatMessage({
                  id: "onboarding1.recoversinglesig",
                })}
                RightIcon={isObi ? undefined : GetStarted}
                flavor="blue"
                style={{
                  marginTop: 20,
                }}
                onPress={action(() => {
                  navigation.navigate(OnboardingRoute.RecoverSinglesig);
                })}
              />
            ) : null}
            {isInRecovery ? null : (
              <Button
                label={intl.formatMessage({
                  id: "onboarding1.demo",
                  defaultMessage: "Enter Demo Mode",
                })}
                RightIcon={isObi ? undefined : GetStarted}
                flavor="blue"
                style={{
                  marginTop: 20,
                }}
                onPress={action(async () => {
                  if (
                    !isMultisigDemoWallet(wallet) ||
                    wallet.type !== configStore.getDefaultMultisigWalletType()
                  ) {
                    await walletsStore.addMultisigDemoWallet();
                  }
                  navigation.navigate(OnboardingRoute.CreateMultisigBiometrics);
                })}
              />
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </InitialBackground>
  );

  function renderTitle() {
    if (isInRecovery) {
      return (
        <FormattedMessage
          id="recovery.keyupdate"
          defaultMessage="Update Wallet Keys?"
        />
      );
    } else {
      if (isObi) {
        return (
          <FormattedMessage
            id="onboarding1.welcometo.obi"
            defaultMessage="Welcome to Obi"
          />
        );
      }
      return (
        <FormattedMessage
          id="onboarding1.welcometo.loop"
          defaultMessage="Welcome to Loop"
        />
      );
    }
  }

  function renderSubTitle() {
    switch (multisigWallet?.keyInRecovery) {
      case "phoneNumber":
        return (
          <FormattedMessage
            id="recovery.phoneupdate"
            defaultMessage="You're updating your multisig wallet's phone number key."
          />
        );
      case "social":
        return (
          <FormattedMessage
            id="recovery.socialupdate"
            defaultMessage="You're updating your multisig wallet's social key."
          />
        );
      default:
        if (isObi)
          return "Obi is the most secure and convenient way to manage assets in the Cosmos.";

        return (
          <FormattedMessage
            id="onboarding1.welcomesubtext"
            defaultMessage="Loop, powered by Obi, is the world's most powerful wallet for Web3."
          />
        );
    }
  }

  function renderContinueButton(keyInRecovery?: MultisigKey | null) {
    let navigationUrl:
      | OnboardingRoute.CreateMultisigPhoneNumber
      | OnboardingRoute.CreateMultisigSocial
      | OnboardingRoute.CreateMultisigBiometrics;

    let labelId: string;
    switch (keyInRecovery) {
      case "phoneNumber":
        navigationUrl = OnboardingRoute.CreateMultisigPhoneNumber;
        labelId = "recovery.continuephone";
        break;
      case "social":
        navigationUrl = OnboardingRoute.CreateMultisigSocial;
        labelId = "recovery.continuesocial";
        break;
      default:
        navigationUrl = OnboardingRoute.CreateMultisigBiometrics;
        labelId = "onboarding1.getstarted";
    }
    return (
      <View>
        {!keyInRecovery && walletsStore.readyWallets.length > 0 ? (
          <Button
            label={intl.formatMessage({
              id: "onboarding1.login",
              defaultMessage: "Login",
            })}
            RightIcon={isObi ? undefined : GetStarted}
            flavor="green"
            onPress={() => {
              accountPickerModalProps.open();
            }}
          />
        ) : null}
        <Button
          label={intl.formatMessage({ id: labelId })}
          RightIcon={isObi ? undefined : GetStarted}
          flavor="green"
          style={{
            marginTop: 20,
          }}
          onPress={action(async () => {
            if (
              !multisigWallet ||
              multisigWallet.type !== configStore.getDefaultMultisigWalletType()
            ) {
              await walletsStore.addMultisigWallet();
            }
            navigation.navigate(navigationUrl);
          })}
        />
      </View>
    );
  }
});
