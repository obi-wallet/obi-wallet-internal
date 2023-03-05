import {
  faCaretDown,
  faCaretUp,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  Beneficiary,
  Draft,
  DraftableObject,
  EntityId,
  FlexAccount,
  GatekeeperConfig,
  RequestObiTerraSignAndBroadcastMsg,
  SinglesigWallet,
  terra,
  Text,
  TextInput,
} from "@obi-wallet/common";
import Slider from "@react-native-community/slider";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  FlatList,
  ImageBackground,
  LayoutAnimation,
  Platform,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useDebounce } from "rooks";
import invariant from "tiny-invariant";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import KeyRoundIcon from "./assets/key-round-icon.svg";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { UsdBalance } from "../../app/balances";
import { Button } from "../../app/button";
import { Background } from "../../app/screens/components/background";
import { NetworkAccountPickerLayout } from "../../app/screens/components/network-account-picker-layout";
import { useMultisigWallet, useStore } from "../../app/stores";
import { getGatekeeperContractAddressesQuery } from "../../queries/gatekeeper";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type AccountsOverviewScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.AccountsOverview
>;

export const AccountsOverviewScreen = observer<AccountsOverviewScreenProps>(
  function AccountsOverviewScreen({ navigation }) {
    return (
      <>
        <Background />
        <NetworkAccountPickerLayout>
          <View style={{ flex: 1, position: "relative" }}>
            <AccountScreenInner />
            <View
              style={{
                position: "absolute",
                zIndex: 10,
                right: 20,
                bottom: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#437DFF",
                  padding: 16,
                  borderRadius: 100,
                }}
                onPress={() => {
                  navigation.navigate(AccountsRoute.AddAccount);
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ color: "#F6F5FF" }} />
              </TouchableOpacity>
            </View>
          </View>
        </NetworkAccountPickerLayout>
      </>
    );
  }
);

const AccountScreenInner = observer(function AccountScreenInner() {
  const { configStore, draftsStore } = useStore();
  const isLoop = configStore.isLoop();

  const wallet = useMultisigWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  const queryClient = useQueryClient();

  return (
    <View style={{ paddingHorizontal: 10, flex: 1 }}>
      <View
        style={{
          backgroundColor: isLoop ? "#1C0C3F" : "#437DFF",
          borderRadius: 16,
        }}
      >
        <ImageBackground
          source={
            isLoop ? require("./assets/loop-account-background.png") : null
          }
          style={{ padding: 10, position: "relative" }}
          resizeMode="cover"
          borderRadius={16}
        >
          <TouchableOpacity style={{ position: "absolute", top: 6, left: 6 }}>
            <KeyRoundIcon />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "column" }}>
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  <FormattedMessage
                    id="accountscreen.accountname"
                    defaultMessage="Obi Smart Account"
                  />
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 10,
              }}
            >
              <UsdBalance />
            </View>
          </View>
        </ImageBackground>
      </View>
      <View style={{ flex: 1 }}>
        <AccountsList />
      </View>
      {draft.isDirty ? (
        <View style={{ margin: 15 }}>
          <Button
            flavor="blue"
            label="Confirm"
            onPress={async () => {
              const { spendLimitGatekeeper } = await queryClient.fetchQuery(
                getGatekeeperContractAddressesQuery({
                  chainId: wallet.chain,
                  address: wallet.address,
                })
              );

              invariant(
                spendLimitGatekeeper,
                "Spend limit gatekeeper address is not set"
              );

              const messages = terra.getUpdateGatekeeperMessages({
                currentGatekeeperConfig: draft.original,
                newGatekeeperConfig: draft.value,
                proxyAddress: wallet.owner.address,
                spendLimitGatekeeper,
              });

              const response = await RequestObiTerraSignAndBroadcastMsg.send({
                multisigKey: wallet.owner.serialize(),
                demoMode: wallet.isDemo,
                messages: messages.map((message) => message.toAmino()),
              });

              // TODO:
              draft.commit({ original: draft.value });
            }}
          />
          <Button
            flavor="cancel"
            label="Cancel"
            onPress={() => {
              draft.reset();
            }}
          />
        </View>
      ) : null}
    </View>
  );
});

const AccountsList = observer(function AccountsList() {
  const { draftsStore } = useStore();
  const wallet = useMultisigWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  const accounts = wallet.getAccounts(draft.value);
  const [itemOpened, setItemOpened] = useState<EntityId | null>(null);
  // TODO:
  const [activeAccount, setActiveAccount] = useState<EntityId | null>(null);

  const data = accounts.ids.map((id) => {
    return {
      id,
      account: accounts.get({ id }),
    };
  });

  return (
    <FlatList
      data={data}
      renderItem={(element) => {
        return (
          <AccountItem
            onOpenToggle={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              itemOpened === element.item.id
                ? setItemOpened(null)
                : setItemOpened(element.item.id);
            }}
            isOpen={itemOpened === element.item.id}
            onSetActive={() => {
              setActiveAccount(element.item.id);
            }}
            active={activeAccount === element.item.id}
            account={element.item.account}
            onDelete={() => {
              switch (element.item.account.type) {
                case "beneficiary":
                  draft.value.beneficiaries.remove({ id: element.item.id });
                  break;
                case "flex-account":
                  draft.value.flexAccounts.remove({ id: element.item.id });
                  break;
                case "singlesig-wallet":
                  wallet.singlesigWallets.remove({ id: element.item.id });
                  break;
              }
            }}
            onChange={(account) => {
              switch (account.type) {
                case "beneficiary":
                  draft.value.beneficiaries.update({
                    id: element.item.id,
                    entity: account,
                  });
                  break;
                case "flex-account":
                  draft.value.flexAccounts.update({
                    id: element.item.id,
                    entity: account,
                  });
                  break;
                case "singlesig-wallet":
                  wallet.singlesigWallets.update({
                    id: element.item.id,
                    entity: account,
                  });
                  break;
              }
            }}
          />
        );
      }}
      keyExtractor={(item) => item.id}
    />
  );
});

interface AbstractAccountItemProps {
  active: boolean;
  onSetActive: () => void;
  isOpen: boolean;
  onOpenToggle: () => void;
  onDelete: () => void;
}

interface AccountItemProps extends AbstractAccountItemProps {
  account: Beneficiary | FlexAccount | SinglesigWallet;
  onDelete: () => void;
  onChange: (account: Beneficiary | FlexAccount | SinglesigWallet) => void;
}

const AccountItem = observer<AccountItemProps>(function AccountItem({
  account,
  ...props
}) {
  switch (account.type) {
    case "beneficiary":
      return <BeneficiaryItem account={account} {...props} />;
    case "flex-account":
      return <FlexAccountItem account={account} {...props} />;
    case "singlesig-wallet":
      return <SinglesigWalletItem account={account} {...props} />;
  }
});

interface BeneficiaryItemProps extends AbstractAccountItemProps {
  account: Beneficiary;
  onChange: (account: Beneficiary) => void;
}

enum BeneficiaryPeriodicity {
  Monthly = "Monthly",
  Annually = "Annually",
}

const BeneficiaryItem = observer<BeneficiaryItemProps>(
  function BeneficiaryItem({
    isOpen,
    onOpenToggle,
    account,
    active,
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

    const dormancyThreshold = (() => {
      const threshold = draft.value.value.dormancyThreshold;
      if (R.has("days", threshold)) return Math.floor(threshold.days / 30);
      if (R.has("months", threshold)) return threshold.months;
      if (R.has("years", threshold)) return threshold.years * 12;
      return 0;
    })();
    const setDormancyThreshold = (threshold: number) => {
      runInAction(() => {
        draft.value.value.dormancyThreshold = { months: threshold };
      });
    };

    const dripRate = Math.floor(draft.value.value.dripSchedule.rate * 100);
    const setDripRate = (rate: number) => {
      runInAction(() => {
        draft.value.value.dripSchedule.rate = rate / 100;
      });
    };

    const inheritancePeriodicity = [
      BeneficiaryPeriodicity.Monthly,
      BeneficiaryPeriodicity.Annually,
    ];
    const selectedPeriodicity = (() => {
      const period = draft.value.value.dripSchedule.period;
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
            draft.value.value.dripSchedule.period = { months: 1 };
            break;
          case BeneficiaryPeriodicity.Annually:
            draft.value.value.dripSchedule.period = { years: 1 };
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

interface FlexAccountItemProps extends AbstractAccountItemProps {
  account: FlexAccount;
  onChange: (account: FlexAccount) => void;
}

enum FlexAccountPeriodicity {
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Yearly = "Yearly",
}

enum FlexAccountRule {
  Strict = "Strict",
  Limited = "Limited",
  Unlocked = "Unlocked",
}

const FlexAccountItem = observer<FlexAccountItemProps>(function FlexItem({
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
    if (R.equals(period, { months: 1 })) return FlexAccountPeriodicity.Monthly;
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
    >
      <ProgressBar amount={70} containerStyle={{ marginVertical: 10 }} />
      <Animatable.View
        duration={400}
        animation={isOpen ? "fadeIn" : "fadeOut"}
        style={{ backgroundColor: "#363636", borderRadius: 7 }}
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
                        <Text style={{ color: "#fff" }}>{selectedPeriod}</Text>
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
});

interface SinglesigWalletItemProps extends AbstractAccountItemProps {
  account: SinglesigWallet;
}

const SinglesigWalletItem = observer<SinglesigWalletItemProps>(
  function SinglesigWalletItem({ account, active, onSetActive }) {
    return (
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderRadius: 7,
          borderColor: active ? "white" : "transparent",
          backgroundColor: "#272727",
          marginVertical: 10,
          padding: 10,
        }}
        onPress={() => {
          onSetActive();
        }}
        disabled={active}
      >
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: 40,
              aspectRatio: 1 / 1,
              backgroundColor: "white",
              borderRadius: 6,
            }}
          />
          <View style={{ paddingLeft: 10 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
              {/* TODO: */}
              $0.00
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#7E7E7E",
              }}
            >
              {Bech32Address.shortenAddress(
                terra.getAddress({ publicKey: account.publicKey }),
                40
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

const Pill = observer<{
  label: string;
  active?: boolean;
  onPress?: () => void;
}>(function Pill({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: active ? "#437DFF" : "transparent",
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
      }}
      onPress={onPress}
    >
      <Text style={{ color: "#fff", fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
});

const AccountContainer = observer<{
  children?: ReactNode;
  isOpen: boolean;
  onOpenToggle: () => void;
  title: string;
  subTitle: string;
  titleStyles?: StyleProp<TextStyle>;
  subTitleStyles?: StyleProp<TextStyle>;
  active?: boolean;
  onSetActive: () => void;
  collapsible?: boolean;
}>(function AccountContainer({
  children,
  isOpen,
  onOpenToggle,
  title,
  subTitle,
  titleStyles,
  subTitleStyles,
  active,
  onSetActive,
}) {
  return (
    <Animatable.View
      duration={400}
      style={{
        borderWidth: 1,
        borderRadius: 7,
        borderColor: active ? "white" : "transparent",
        backgroundColor: "#272727",
        marginVertical: 10,
        padding: 10,
      }}
    >
      <TouchableOpacity
        style={{ flexDirection: "row" }}
        onPress={onSetActive}
        disabled={active}
      >
        <View
          style={{
            width: 40,
            aspectRatio: 1 / 1,
            backgroundColor: "white",
            borderRadius: 6,
          }}
        />
        <View style={{ paddingLeft: 10 }}>
          <Text
            style={[
              {
                color: "white",
                fontSize: 18,
                fontWeight: "600",
              },
              titleStyles,
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              {
                fontSize: 12,
              },
              subTitleStyles,
            ]}
          >
            {subTitle}
          </Text>
        </View>
      </TouchableOpacity>

      {children && (
        <TouchableOpacity
          onPress={onOpenToggle}
          style={{
            position: "absolute",
            right: 5,
            top: 5,
            paddingLeft: 10,
            paddingBottom: 10,
          }}
        >
          <View
            style={{
              width: 20,
              aspectRatio: 1 / 1,
              backgroundColor: "white",
              borderRadius: 100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon icon={isOpen ? faCaretUp : faCaretDown} />
          </View>
        </TouchableOpacity>
      )}
      {children}
    </Animatable.View>
  );
});

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
