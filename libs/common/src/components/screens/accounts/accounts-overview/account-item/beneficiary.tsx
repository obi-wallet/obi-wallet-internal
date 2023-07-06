import { Beneficiary } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { View } from "react-native";
import { View as AnimatableView } from "react-native-animatable";

import { AbstractAccountItemProps, AccountContainer, Pill } from "./common";
import { BaseTextInput, Text } from "../../../../typography";

export interface BeneficiaryItemProps extends AbstractAccountItemProps {
  account: Beneficiary;
}

export enum BeneficiaryPeriodicity {
  Monthly = "Monthly",
  Annually = "Annually",
}

export const BeneficiaryItem = observer<BeneficiaryItemProps>(
  function BeneficiaryItem({
    isOpen,
    onOpenToggle,
    account,
    active,
    onSetActive,
    onDelete,
  }) {
    const dormancyThreshold = (() => {
      const threshold = account.dormancyThreshold;
      if (R.has("days", threshold)) return Math.floor(threshold.days / 30);
      if (R.has("months", threshold)) return threshold.months;
      if (R.has("years", threshold)) return threshold.years * 12;
      return 0;
    })();
    const setDormancyThreshold = (threshold: number) => {
      account.setDormancyThreshold({ months: threshold });
    };

    const dripRate = Math.floor(account.dripSchedule.rate * 100);
    const setDripRate = (rate: number) => {
      account.setDripRate(rate / 100);
    };

    const inheritancePeriodicity = [
      BeneficiaryPeriodicity.Monthly,
      BeneficiaryPeriodicity.Annually,
    ];
    const selectedPeriodicity = ((
      period: Beneficiary["dripSchedule"]["period"]
    ) => {
      if (R.equals(period, { months: 1 }))
        return BeneficiaryPeriodicity.Monthly;
      if (R.equals(period, { years: 1 }))
        return BeneficiaryPeriodicity.Annually;
      return inheritancePeriodicity[0];
    })(account.dripSchedule.period);
    const setSelectedPeriodicity = (periodicity: BeneficiaryPeriodicity) => {
      switch (periodicity) {
        case BeneficiaryPeriodicity.Monthly:
          account.setDripPeriod({ months: 1 });
          break;
        case BeneficiaryPeriodicity.Annually:
          account.setDripPeriod({ years: 1 });
          break;
      }
    };

    return (
      <AccountContainer
        isOpen={isOpen}
        onOpenToggle={onOpenToggle}
        title={account.meta.name}
        subTitle="Inheritance"
        subTitleStyles={{
          color: "white",
        }}
        active={active}
        onSetActive={onSetActive}
        account={account}
        onDelete={onDelete}
      >
        {isOpen && (
          <AnimatableView
            duration={400}
            animation={isOpen ? "fadeIn" : "fadeOut"}
            style={{
              backgroundColor: "#363636",
              borderRadius: 7,
              marginTop: 10,
              paddingVertical: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                marginHorizontal: 35,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "white",
                  marginRight: 10,
                  flex: 1,
                }}
              >
                Inheritance triggers after how many months of inactivity?
              </Text>
              <BaseTextInput
                style={{
                  backgroundColor: "#272727",
                  borderRadius: 7,
                  paddingHorizontal: 10,
                  color: "white",
                  fontSize: 26,
                  minWidth: 60,
                  textAlign: "center",
                }}
                value={dormancyThreshold ? dormancyThreshold.toString() : ""}
                onChangeText={(value) => {
                  const res = value.replace(/[^0-9.]/g, "");
                  setDormancyThreshold(Number(res));
                }}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                marginHorizontal: 35,
                alignItems: "center",
                marginTop: 30,
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "white",
                  marginRight: 10,
                  flex: 1,
                }}
              >
                Recipient receives funds at the following rate (%):
              </Text>
              <BaseTextInput
                style={{
                  backgroundColor: "#272727",
                  borderRadius: 7,
                  paddingHorizontal: 10,
                  color: "white",
                  fontSize: 26,
                  alignSelf: "flex-end",
                  minWidth: 60,
                  textAlign: "center",
                }}
                value={dripRate ? dripRate.toString() : ""}
                onChangeText={(value) => {
                  const res = value.replace(/[^0-9.]/g, "");
                  const newDripRate = Number(res);
                  if (newDripRate <= 100 && newDripRate >= 0) {
                    setDripRate(newDripRate);
                  }
                }}
                placeholder="0"
                placeholderTextColor="#555"
                keyboardType="numeric"
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                flex: 1,
                justifyContent: "space-around",
                marginTop: 30,
                marginBottom: 20,
              }}
            >
              {inheritancePeriodicity.map((item) => (
                <Pill
                  label={item}
                  active={item === selectedPeriodicity}
                  key={item}
                  onPress={() => {
                    setSelectedPeriodicity(item);
                  }}
                />
              ))}
            </View>
          </AnimatableView>
        )}
      </AccountContainer>
    );
  }
);
