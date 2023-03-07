import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  Draft,
  DraftableObject,
  FlexAccount,
  Text,
  TextInput,
} from "@obi-wallet/common";
import Slider from "@react-native-community/slider";
import { DateTime } from "luxon";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { useCallback, useContext, useEffect, useState } from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import * as Animatable from "react-native-animatable";
import { useDebounce } from "rooks";

import { AbstractAccountItemProps, AccountContainer, Pill } from "./common";
import { Button } from "../../../../app/button";
import { PermissionedAddressesContext } from "../permissioned-address-context";

export interface FlexAccountItemProps extends AbstractAccountItemProps {
  account: FlexAccount;
  onChange: (account: FlexAccount) => void;
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
    active = false,
    onSetActive,
    onDelete,
    onChange,
  }) {
    const [draft] = useState(() => {
      return new Draft({
        original: new DraftableObject(account),
      });
    });

    useEffect(() => {
      if (!R.equals(draft.original.value, account)) {
        draft.commit({ original: new DraftableObject(account) });
      }
    }, [account, draft]);

    const amount = draft.value.value.spendLimit?.amount;
    const setAmount = useCallback(
      (amount: number) => {
        runInAction(() => {
          if (draft.value.value.spendLimit) {
            draft.value.value.spendLimit.amount = amount;
          }
        });
      },
      [draft]
    );
    const debouncedSetAmount = useDebounce(setAmount, 50);

    const [timeOpened, setTimeOpened] = useState(false);
    const periodicity = [
      FlexAccountPeriodicity.Daily,
      FlexAccountPeriodicity.Weekly,
      FlexAccountPeriodicity.Monthly,
      FlexAccountPeriodicity.Yearly,
    ];
    const selectedPeriod = (() => {
      const period = draft.value.value.spendLimit?.period;
      if (R.equals(period, { days: 1 })) return FlexAccountPeriodicity.Daily;
      if (R.equals(period, { days: 7 })) return FlexAccountPeriodicity.Weekly;
      if (R.equals(period, { months: 1 }))
        return FlexAccountPeriodicity.Monthly;
      if (R.equals(period, { years: 1 })) return FlexAccountPeriodicity.Yearly;
      return periodicity[0];
    })();
    const setSelectedPeriod = (period: FlexAccountPeriodicity) => {
      runInAction(() => {
        if (!draft.value.value.spendLimit) return;

        switch (period) {
          case FlexAccountPeriodicity.Daily:
            draft.value.value.spendLimit.period = { days: 1 };
            break;
          case FlexAccountPeriodicity.Weekly:
            draft.value.value.spendLimit.period = { days: 7 };
            break;
          case FlexAccountPeriodicity.Monthly:
            draft.value.value.spendLimit.period = { months: 1 };
            break;
          case FlexAccountPeriodicity.Yearly:
            draft.value.value.spendLimit.period = { years: 1 };
            break;
        }
      });
    };

    const flexRules = [
      FlexAccountRule.Strict,
      FlexAccountRule.Limited,
      FlexAccountRule.Unlocked,
    ];

    const getRemainingTime = useCallback(() => {
      if (!draft.original.value.autoSign) return null;

      const remainingTime = DateTime.fromISO(
        draft.original.value.autoSign?.endTime
      ).diff(DateTime.now(), "seconds");
      return remainingTime.toMillis() >= 0 ? remainingTime : null;
    }, [draft.original.value.autoSign]);

    const [remainingTime, setRemainingTime] = useState(getRemainingTime);

    const getActiveFlexRule = useCallback(() => {
      if (draft.original.value.autoSign && getRemainingTime()) {
        return FlexAccountRule.Unlocked;
      } else if (draft.original.value.spendLimit) {
        return FlexAccountRule.Limited;
      } else {
        return FlexAccountRule.Strict;
      }
    }, [
      draft.original.value.autoSign,
      draft.original.value.spendLimit,
      getRemainingTime,
    ]);

    const getNextFlexRule = useCallback(() => {
      if (draft.value.value.autoSign) {
        return FlexAccountRule.Unlocked;
      } else if (draft.value.value.spendLimit) {
        return FlexAccountRule.Limited;
      } else {
        return FlexAccountRule.Strict;
      }
    }, [draft.value.value.autoSign, draft.value.value.spendLimit]);
    const activeFlexRule = getActiveFlexRule();
    const nextFlexRule = getNextFlexRule();

    const setNextFlexRule = useCallback(
      (rule: FlexAccountRule) => {
        runInAction(() => {
          if (getNextFlexRule() === rule) return;

          switch (rule) {
            case FlexAccountRule.Strict:
              draft.value.value.spendLimit = null;
              draft.value.value.autoSign = null;
              break;
            case FlexAccountRule.Limited:
              draft.value.value.autoSign = null;
              draft.value.value.spendLimit = draft.value.value.spendLimit ?? {
                amount: 0,
                period: {
                  days: 1,
                },
              };
              break;
            case FlexAccountRule.Unlocked:
              draft.value.value.autoSign = {
                endTime: DateTime.now().plus({ minutes: 30 }).toISO(),
              };
              break;
          }

          setRemainingTime(getRemainingTime());
        });
      },
      [draft, getNextFlexRule, getRemainingTime, setRemainingTime]
    );

    useEffect(() => {
      const interval = setInterval(() => {
        setRemainingTime(getRemainingTime());
      }, 1000);
      return () => clearInterval(interval);
    }, [getRemainingTime]);

    const getRuleText = () => {
      switch (nextFlexRule) {
        case FlexAccountRule.Unlocked:
          return "WARNING: No keys required to sign transactions. This setting will revert after 30:00 minutes or until session expires.";
        case FlexAccountRule.Strict:
          return "All transactions will require X keys to complete.";
        case FlexAccountRule.Limited:
          return "Transactions under limit amount only require one key.";
      }
    };

    const permissionedAddresses = useContext(PermissionedAddressesContext);
    const permissionedAddress = permissionedAddresses?.find(
      (address) => address.address === account.address
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
        title={draft.value.value.meta.name}
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
        <Animatable.View
          duration={400}
          animation={isOpen ? "fadeIn" : "fadeOut"}
          style={{
            backgroundColor: "#363636",
            borderRadius: 7,
            marginTop: isOpen ? 10 : 0,
          }}
        >
          {isOpen && (
            <>
              <View
                style={{
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    margin: 5,
                    fontSize: 12,
                    marginBottom: 20,
                  }}
                >
                  Flex Rules
                </Text>
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
                        setNextFlexRule(fr);
                      }}
                    />
                  ))}
                </View>
                <View style={{ padding: 10 }}>
                  <Text style={{ color: "#fff", fontSize: 12 }}>
                    {getRuleText()}
                  </Text>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    opacity: nextFlexRule === FlexAccountRule.Limited ? 1 : 0.5,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    {timeOpened ? (
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
                    ) : (
                      <>
                        <TextInput
                          style={{
                            backgroundColor: "#272727",
                            borderWidth: 0,
                            borderRadius: 10,
                            color: "#fff",
                            padding: 5,
                            paddingHorizontal: 20,
                            fontSize: 25,
                            fontFamily: "Poppins",
                          }}
                          value={`$${amount ?? 0}`}
                          editable={nextFlexRule === FlexAccountRule.Limited}
                          onChangeText={(value) => {
                            const res = value.replace(/[^0-9.]/g, "");
                            debouncedSetAmount(Number(res));
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
                      </>
                    )}
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 10,
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
                    onValueChange={(value) => {
                      debouncedSetAmount(value);
                    }}
                    disabled={nextFlexRule !== FlexAccountRule.Limited}
                    value={(amount || 0) as number}
                  />
                </View>
                <View style={{ margin: 15 }}>
                  {draft.isDirty ? (
                    <>
                      <Button
                        flavor="blue"
                        label="Confirm"
                        onPress={() => {
                          onChange(draft.value.value);
                        }}
                      />
                      <Button
                        flavor="cancel"
                        label="Cancel"
                        onPress={() => {
                          draft.reset();
                        }}
                      />
                    </>
                  ) : null}
                  <TouchableOpacity onPress={onDelete}>
                    <Text
                      style={{
                        color: "#437DFF",
                        textAlign: "center",
                        margin: 10,
                      }}
                    >
                      Delete Flex Account
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </Animatable.View>
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
