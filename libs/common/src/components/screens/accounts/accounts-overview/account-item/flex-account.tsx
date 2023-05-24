import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import { FlexAccount, FlexAccountPermissionedAddress } from "@obi-wallet/sdk";
import Slider from "@react-native-community/slider";
import { DateTime } from "luxon";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  LayoutAnimation,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useThrottle } from "rooks";

import { AbstractAccountItemProps, AccountContainer, Pill } from "./common";
import { AnimatableView } from "../../../../animatable";
import { AnimatedText } from "../../../../animated-text";
import { BaseTextInput, Text } from "../../../../typography";
import { PermissionedAddressesContext } from "../permissioned-addresses-context";

export interface FlexAccountItemProps extends AbstractAccountItemProps {
  originalAccount: FlexAccount | null;
  account: FlexAccount;
}

export enum FlexAccountPeriodicity {
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Yearly = "Yearly",
}

export enum FlexAccountRule {
  Strict = "Strict",
  Limited = "Limited",
  Unlocked = "Unlocked",
}

export const FlexAccountItem = observer<FlexAccountItemProps>(
  function FlexItem({
    isOpen = true,
    onOpenToggle,
    account,
    originalAccount,
    active = false,
    onSetActive,
    onDelete,
  }) {
    const wallet = useCurrentWallet();
    const threshold = {
      required: wallet.owner.threshold,
      keys: wallet.owner.keys.length,
    };

    const amount =
      account.spendLimit?.amount === 0 ? "" : account.spendLimit?.amount;
    const setAmount = useCallback(
      (amount: number) => {
        if (!account.spendLimit) return;

        account.setSpendLimit({
          ...account.spendLimit,
          amount,
        });
      },
      [account]
    );
    const [throttledSetAmount] = useThrottle(setAmount, 50);

    const [timeOpened, setTimeOpened] = useState(false);
    const periodicity = [
      FlexAccountPeriodicity.Daily,
      FlexAccountPeriodicity.Weekly,
      FlexAccountPeriodicity.Monthly,
      FlexAccountPeriodicity.Yearly,
    ];
    const selectedPeriod = (() => {
      const period = account.spendLimit?.period;
      if (R.equals(period, { days: 1 })) return FlexAccountPeriodicity.Daily;
      if (R.equals(period, { days: 7 })) return FlexAccountPeriodicity.Weekly;
      if (R.equals(period, { months: 1 }))
        return FlexAccountPeriodicity.Monthly;
      if (R.equals(period, { years: 1 })) return FlexAccountPeriodicity.Yearly;
      return periodicity[0];
    })();
    const setSelectedPeriod = (period: FlexAccountPeriodicity) => {
      if (!account.spendLimit) return;

      const newPeriod = (() => {
        switch (period) {
          case FlexAccountPeriodicity.Daily:
            return { days: 1 };
          case FlexAccountPeriodicity.Weekly:
            return { days: 7 };
          case FlexAccountPeriodicity.Monthly:
            return { months: 1 };
          case FlexAccountPeriodicity.Yearly:
            return { years: 1 };
        }
      })();

      account.setSpendLimit({
        ...account.spendLimit,
        period: newPeriod,
      });
    };

    const flexRules = [
      FlexAccountRule.Strict,
      FlexAccountRule.Limited,
      FlexAccountRule.Unlocked,
    ];

    const [remainingTime, setRemainingTime] = useState(
      originalAccount?.remainingAutoSignDuration
    );

    const getActiveFlexRule = () => {
      if (originalAccount?.hasActiveAutoSign) {
        return FlexAccountRule.Unlocked;
      } else if (originalAccount?.spendLimit) {
        return FlexAccountRule.Limited;
      } else {
        return FlexAccountRule.Strict;
      }
    };

    const getNextFlexRule = () => {
      if (account.hasActiveAutoSign) {
        return FlexAccountRule.Unlocked;
      } else if (account.spendLimit) {
        return FlexAccountRule.Limited;
      } else {
        return FlexAccountRule.Strict;
      }
    };
    const activeFlexRule = getActiveFlexRule();
    const nextFlexRule = getNextFlexRule();

    const setNextFlexRule = (rule: FlexAccountRule) => {
      runInAction(() => {
        if (getNextFlexRule() === rule) return;

        switch (rule) {
          case FlexAccountRule.Strict:
            account.setSpendLimit(null);
            account.clearAutoSign();
            break;
          case FlexAccountRule.Limited:
            account.setSpendLimit(
              account.spendLimit ?? {
                amount: 0,
                period: {
                  days: 1,
                },
              }
            );
            account.clearAutoSign();
            break;
          case FlexAccountRule.Unlocked:
            account.enableAutoSign(DateTime.now().plus({ minutes: 30 }));
            break;
        }

        setRemainingTime(originalAccount?.remainingAutoSignDuration);
      });
    };

    useEffect(() => {
      const interval = setInterval(() => {
        setRemainingTime(originalAccount?.remainingAutoSignDuration);
      }, 1000);
      return () => clearInterval(interval);
    }, [originalAccount]);

    const getRuleText = () => {
      switch (nextFlexRule) {
        case FlexAccountRule.Unlocked:
          return "WARNING: No keys required to sign transactions. This setting will revert after 30:00 minutes or until session expires.";
        case FlexAccountRule.Strict:
          return `All transactions will require ${threshold.required} of ${threshold.keys} keys to complete.`;
        case FlexAccountRule.Limited:
          return "Transactions under limit amount only require one key.";
      }
    };

    const permissionedAddresses = useContext(PermissionedAddressesContext);
    const permissionedAddress = permissionedAddresses?.find(
      (
        permissionedAddress
      ): permissionedAddress is FlexAccountPermissionedAddress => {
        return (
          permissionedAddress.address === account.address &&
          FlexAccountPermissionedAddress.safeParse(permissionedAddress).success
        );
      }
    );
    const spendLimit = permissionedAddress?.params.spend_limits?.[0];
    const progressbarAmount = spendLimit
      ? 100 -
        (100 * parseInt(spendLimit.limit_remaining, 10)) /
          parseInt(spendLimit.amount, 10)
      : 0;

    return (
      <AccountContainer
        isOpen={isOpen}
        onOpenToggle={onOpenToggle}
        title={account.meta.name}
        subTitle={`${activeFlexRule} Flex Account${
          remainingTime ? ` ⏱ ${remainingTime.toFormat("m:ss")}` : ""
        }`}
        subTitleStyles={{
          color:
            activeFlexRule === FlexAccountRule.Unlocked ? "#FFE200" : "white",
        }}
        active={active}
        onSetActive={onSetActive}
        account={account}
        onDelete={onDelete}
      >
        <ProgressBar
          amount={progressbarAmount}
          containerStyle={{ marginTop: 10 }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <Text style={{ color: "#6bbeba", fontSize: 10 }}>Limit</Text>
          <Text style={{ color: "#6bbeba", fontSize: 10 }}>
            {spendLimit
              ? `$${Math.floor(parseInt(spendLimit.amount, 10) / 10 ** 6)}`
              : "NA"}
          </Text>
        </View>
        <AnimatableView
          duration={400}
          animation={isOpen ? "fadeIn" : "fadeOut"}
          style={{
            backgroundColor: "#363636",
            borderRadius: 7,
            marginTop: isOpen ? 10 : 0,
            paddingBottom: isOpen ? 20 : 0,
          }}
        >
          {isOpen && (
            <View
              style={{
                marginTop: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  justifyContent: "space-around",
                }}
              >
                {flexRules.map((fr) => (
                  <Pill
                    label={fr}
                    active={fr === nextFlexRule}
                    key={fr}
                    onPress={() => {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut
                      );
                      setNextFlexRule(fr);
                    }}
                  />
                ))}
              </View>
              <AnimatableView duration={400} animation="fadeIn">
                <AnimatedText
                  style={{ padding: 10 }}
                  textStyle={{
                    color: "#fff",
                    fontSize: 12,
                    marginVertical: 10,
                  }}
                  text={getRuleText()}
                />
                <AnimatableView
                  duration={400}
                  animation={
                    nextFlexRule === FlexAccountRule.Limited
                      ? "fadeIn"
                      : "fadeOut"
                  }
                  style={{
                    alignItems: "center",
                    opacity: nextFlexRule === FlexAccountRule.Limited ? 1 : 0.5,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    {timeOpened && (
                      <>
                        {periodicity.map((period) => (
                          <TouchableOpacity
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              padding: 10,
                              backgroundColor:
                                selectedPeriod === period
                                  ? "#437DFF"
                                  : "transparent",
                              borderRadius: 10,
                            }}
                            onPress={() => {
                              setSelectedPeriod(period);
                              setTimeOpened(false);
                            }}
                            key={period}
                          >
                            <Text style={{ color: "#fff" }}>{period}</Text>
                          </TouchableOpacity>
                        ))}
                      </>
                    )}

                    {!timeOpened && (
                      <AnimatableView
                        duration={400}
                        animation={
                          nextFlexRule === FlexAccountRule.Limited
                            ? "fadeInDown"
                            : "fadeOutDown"
                        }
                        style={{
                          flexDirection: "row",

                          ...(nextFlexRule === FlexAccountRule.Limited
                            ? {}
                            : { height: 0, opacity: 0 }),
                        }}
                      >
                        <BaseTextInput
                          style={{
                            backgroundColor: "#272727",
                            borderWidth: 0,
                            borderRadius: 10,
                            color: "#fff",
                            padding: 5,
                            paddingHorizontal: 20,
                            fontSize: 25,
                            fontFamily: "Poppins",
                            height: 48,
                          }}
                          value={amount ? `$${amount}` : ""}
                          placeholder="$0"
                          editable={nextFlexRule === FlexAccountRule.Limited}
                          onChangeText={(value) => {
                            const res = value.replace(/[^0-9.]/g, "");
                            throttledSetAmount(Number(res));
                          }}
                        />
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 10,
                          }}
                          onPress={() => setTimeOpened(true)}
                          disabled={nextFlexRule !== FlexAccountRule.Limited}
                        >
                          <Text style={{ color: "#fff" }}>
                            {selectedPeriod}
                          </Text>
                          <FontAwesomeIcon
                            icon={faCaretDown}
                            style={{ color: "#fff" }}
                          />
                        </TouchableOpacity>
                      </AnimatableView>
                    )}
                  </View>
                </AnimatableView>
                <AnimatableView
                  duration={400}
                  animation={
                    nextFlexRule === FlexAccountRule.Limited
                      ? "fadeIn"
                      : "fadeOut"
                  }
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 10,

                    ...(nextFlexRule === FlexAccountRule.Limited
                      ? { paddingTop: 10 }
                      : { height: 0 }),
                  }}
                >
                  <Slider
                    style={{
                      flex: 1,
                    }}
                    minimumTrackTintColor="#437DFF"
                    maximumTrackTintColor="#7E7E7E"
                    maximumValue={500}
                    minimumValue={0}
                    step={1}
                    onSlidingComplete={(value) => {
                      setAmount(value);
                    }}
                    onValueChange={(value) => {
                      throttledSetAmount(value);
                    }}
                    disabled={nextFlexRule !== FlexAccountRule.Limited}
                    value={(amount || 0) as number}
                  />
                </AnimatableView>
              </AnimatableView>
            </View>
          )}
        </AnimatableView>
      </AccountContainer>
    );
  }
);

const ProgressBar = observer(function ProgressBar({
  amount,
  containerStyle,
  barStyle,
}: {
  amount: number;
  containerStyle?: ViewStyle;
  barStyle?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: "#363636",
          borderRadius: 20,
          height: 10,
        },
        containerStyle,
      ]}
    >
      <View
        style={[
          {
            backgroundColor: "#437DFF",
            height: 10,
            width: `${amount}%`,
            borderRadius: 20,
          },
          barStyle,
        ]}
      />
    </View>
  );
});
