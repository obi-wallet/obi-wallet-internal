import { Beneficiary, Text, TextInput } from "@obi-wallet/common";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

import { AbstractAccountItemProps, AccountContainer, Pill } from "./common";

export interface BeneficiaryItemProps extends AbstractAccountItemProps {
  account: Beneficiary;
  onChange: (account: Beneficiary) => void;
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
    onChange,
  }) {
    const dormancyThreshold = (() => {
      const threshold = account.dormancyThreshold;
      if (R.has("days", threshold)) return Math.floor(threshold.days / 30);
      if (R.has("months", threshold)) return threshold.months;
      if (R.has("years", threshold)) return threshold.years * 12;
      return 0;
    })();
    const setDormancyThreshold = (threshold: number) => {
      onChange({
        ...account,
        dormancyThreshold: { months: threshold },
      });
    };

    const dripRate = Math.floor(account.dripSchedule.rate * 100);
    const setDripRate = (rate: number) => {
      onChange({
        ...account,
        dripSchedule: {
          ...account.dripSchedule,
          rate: rate / 100,
        },
      });
    };

    const inheritancePeriodicity = [
      BeneficiaryPeriodicity.Monthly,
      BeneficiaryPeriodicity.Annually,
    ];
    const selectedPeriodicity = (() => {
      const period = account.dripSchedule.period;
      if (R.equals(period, { months: 1 }))
        return BeneficiaryPeriodicity.Monthly;
      if (R.equals(period, { years: 1 }))
        return BeneficiaryPeriodicity.Annually;
      return inheritancePeriodicity[0];
    })();
    const setSelectedPeriodicity = (periodicity: BeneficiaryPeriodicity) => {
      runInAction(() => {
        switch (periodicity) {
          case BeneficiaryPeriodicity.Monthly:
            onChange({
              ...account,
              dripSchedule: {
                ...account.dripSchedule,
                period: { months: 1 },
              },
            });
            break;
          case BeneficiaryPeriodicity.Annually:
            onChange({
              ...account,
              dripSchedule: {
                ...account.dripSchedule,
                period: { years: 1 },
              },
            });
            break;
        }
      });
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
      >
        <>
          {isOpen && (
            <Animatable.View
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
                <TextInput
                  style={{
                    backgroundColor: "#272727",
                    borderRadius: 7,
                    paddingHorizontal: 10,
                    color: "white",
                    fontSize: 26,
                    fontFamily: "Poppins",
                  }}
                  value={dormancyThreshold.toString()}
                  onChangeText={(value) => {
                    const res = value.replace(/[^0-9.]/g, "");
                    setDormancyThreshold(Number(res));
                  }}
                  keyboardType="numeric"
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
                <TextInput
                  style={{
                    backgroundColor: "#272727",
                    borderRadius: 7,
                    paddingHorizontal: 10,
                    color: "white",
                    fontSize: 26,
                    fontFamily: "Poppins",
                    alignSelf: "flex-end",
                  }}
                  value={(dripRate ?? 0).toString()}
                  onChangeText={(value) => {
                    const res = value.replace(/[^0-9.]/g, "");
                    setDripRate(Number(res));
                  }}
                  keyboardType="numeric"
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  justifyContent: "space-around",
                  marginTop: 30,
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
              <View style={{ margin: 15 }}>
                <TouchableOpacity onPress={onDelete}>
                  <Text
                    style={{
                      color: "#437DFF",
                      textAlign: "center",
                      margin: 10,
                    }}
                  >
                    Delete Beneficiary
                  </Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          )}
        </>
      </AccountContainer>
    );
  }
);
