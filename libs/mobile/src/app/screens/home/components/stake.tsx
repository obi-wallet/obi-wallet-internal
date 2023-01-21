import styled from "@emotion/native";
import { useTheme } from "@emotion/react";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  Delegation,
  ExtendedValidator,
  isAnyTerraMultisigWallet,
  RequestObiTerraSignAndBroadcastMsg,
  terra,
  Text,
  TextInput,
  UnbondingDelegation,
} from "@obi-wallet/common";
import Fuse from "fuse.js";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleProp,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { GestureResponderEvent } from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import invariant from "tiny-invariant";

import {
  formatCoin,
  formatExtendedCoin,
  useDelegations,
  useRewards,
  useUnbondingDelegations,
  useValidators,
} from "../../../balances";
import { useMultisigWallet, useStore } from "../../../stores";
import { Back } from "../../components/back";
import { CoinIcon } from "../../components/coin-icon";
import { KeyboardAvoidingView } from "../../components/keyboard-avoiding-view";
import { ObiLogo } from "../../components/obi-logo";
import {
  isSmallScreen,
  isSmallScreenNumber,
} from "../../components/screen-size";

const SelectedValidatorContext = createContext<{
  selectedValidator: ExtendedValidator | null;
  setSelectedValidator: (validator: ExtendedValidator | null) => void;
}>(null!);

export const Stake = observer(() => {
  const theme = useTheme();
  const SafeArea = useSafeAreaInsets();
  const { refreshDelegations } = useDelegations();
  const { refreshUnbondingDelegations } = useUnbondingDelegations();
  const { refreshValidators } = useValidators();
  const { refreshRewards } = useRewards();

  const [selectedValidator, setSelectedValidator] =
    useState<ExtendedValidator | null>(null);

  useEffect(() => {
    void refreshDelegations();
    void refreshUnbondingDelegations();
    void refreshValidators();
    void refreshRewards();
  }, [
    refreshDelegations,
    refreshUnbondingDelegations,
    refreshValidators,
    refreshRewards,
  ]);

  const children = (
    <SelectedValidatorContext.Provider
      value={{
        setSelectedValidator,
        selectedValidator,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.background,
          flex: 1,
          padding: 10,
          paddingBottom: 0,
          paddingTop: SafeArea.top,
        }}
      >
        <Back />
        <Balance />
        <StakingOptions />
      </View>
    </SelectedValidatorContext.Provider>
  );

  if (selectedValidator) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return children;
});
//staking options take remaining space
const StakingOptions = observer(() => {
  const { chainStore } = useStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const { delegations } = useDelegations();
  const { unbondingDelegations } = useUnbondingDelegations();

  const totalDelegations = {
    denom: chainStore.currentTerraChainInformation.denom,
    amount: R.sum(
      delegations.map((delegation) => {
        return parseInt(delegation.balance.amount, 10);
      })
    ).toString(),
  };

  const formattedDelegations = formatCoin(totalDelegations);
  const delegationsContent = `${formattedDelegations.amount} ${formattedDelegations.denom}`;

  const totalUnbondingDelegations = {
    denom: chainStore.currentTerraChainInformation.denom,
    amount: R.sum(
      unbondingDelegations.map((delegation) => {
        return parseInt(delegation.balance.amount, 10);
      })
    ).toString(),
  };

  const formattedUnbondingDelegations = formatCoin(totalUnbondingDelegations);
  const unbondingDelegationsContent = `${formattedUnbondingDelegations.amount} ${formattedUnbondingDelegations.denom}`;

  return (
    <View
      style={{
        flex: 1,
        marginTop: 20,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#272727",
            margin: 5,
            justifyContent: "center",
            paddingHorizontal: 20,
            borderRadius: 7,
            borderWidth: selectedTab === 0 ? 1 : 0,
            borderColor: "white",
          }}
          onPress={() => setSelectedTab(0)}
        >
          <FontAwesomeIcon icon={faHome} color="white" />
        </TouchableOpacity>
        <TabPill
          style={{ flex: 1 }}
          onPress={() => setSelectedTab(1)}
          active={selectedTab === 1}
          label="My Stake"
          content={delegationsContent}
        />
        <TabPill
          style={{ flex: 1 }}
          onPress={() => {
            setSelectedTab(2);
          }}
          active={selectedTab === 2}
          label="Unstaking"
          content={unbondingDelegationsContent}
        />
      </View>
      {selectedTab === 0 && <Validators />}
      {selectedTab === 1 && <MyStake />}
      {selectedTab === 2 && <Unstaking />}
    </View>
  );
});

function TabPill({
  style,
  onPress,
  active,
  label,
  content,
}: {
  label: string;
  content: string;
  style?: StyleProp<ViewStyle>;
  onPress: (event: GestureResponderEvent) => void;
  active: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        {
          borderWidth: active ? 1 : 0,
          borderColor: "white",
          borderRadius: 7,
          margin: 5,
          padding: 10,
          backgroundColor: "#272727",
        },
        style,
      ]}
      onPress={onPress}
    >
      <Text style={{ fontSize: 10, color: "white" }}>{label}</Text>
      <Text style={{ fontSize: 15, color: "white" }}>{content}</Text>
    </TouchableOpacity>
  );
}

const Balance = observer(() => {
  const { chainStore, configStore } = useStore();
  const { rewards } = useRewards();
  const isObi = configStore.isObi();

  const totalRewards =
    rewards.length > 0
      ? rewards[0]
      : {
          denom: chainStore.currentTerraChainInformation.denom,
          amount: "0",
        };
  const formattedRewards = formatCoin(totalRewards);

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginTop: isSmallScreenNumber(5, 15),
        backgroundColor: isObi ? "#437DFF" : "transparent",
        borderRadius: 7,
        padding: 10,
      }}
    >
      <Text style={{ color: "white" }}>Available Rewards</Text>
      <View
        style={{
          flexDirection: "row",
          marginTop: 10,
        }}
      >
        <View
          style={{
            height: 36,
            width: 36,
            borderRadius: 10,
            marginRight: 12,
          }}
        >
          <CoinIcon source={formattedRewards.icon} />
        </View>
        <Text
          style={{
            fontSize: 24,
            color: "white",
            fontWeight: "400",
            marginLeft: 10,
          }}
        >
          {formattedRewards.amount} {formattedRewards.denom}
        </Text>
      </View>
      <TouchableHighlight
        style={{
          backgroundColor: "white",
          width: "100%",
          margin: 10,
          padding: 10,
          borderRadius: 32,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          Alert.alert("Not implemented yet");
        }}
      >
        <Text style={{ color: "#437DFF" }}>Withdraw All Rewards</Text>
      </TouchableHighlight>
    </View>
  );
});

function Validators() {
  const { validators } = useValidators();
  const wallet = useMultisigWallet();

  const [needle, setNeedle] = useState("");
  const { selectedValidator, setSelectedValidator } = useContext(
    SelectedValidatorContext
  );
  const { activeValidators, fuse } = useMemo(() => {
    const activeValidators = validators.filter((validator) => {
      return validator.active;
    });
    const fuse = new Fuse(validators, { keys: ["label"], threshold: 0 });

    return {
      activeValidators,
      fuse,
    };
  }, [validators]);

  const validatorsToShow = needle
    ? fuse.search(needle).map((result) => result.item)
    : activeValidators;

  return (
    <View style={{ flex: 1, marginTop: 10 }}>
      {selectedValidator === null && (
        <View style={{ flexDirection: "row" }}>
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 15, color: "white" }}>Validators</Text>
            <Text style={{ fontSize: 10, color: "white" }}>
              {activeValidators.length} active validators
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              style={{
                color: "#ffffff",
                borderColor: "#ffffff",
                borderRadius: 32,
                borderWidth: 1,
                padding: 10,
              }}
              placeholder="Search"
              onChangeText={(text) => setNeedle(text)}
              value={needle}
            />

            <FontAwesomeIcon
              icon={faSearch}
              style={{
                position: "absolute",
                right: 10,
                top: 12,
                color: "white",
              }}
            />
          </View>
        </View>
      )}
      {selectedValidator === null ? (
        <FlatList
          data={validatorsToShow}
          renderItem={({ item }) => (
            <ValidatorItem
              validator={item}
              onPress={setSelectedValidator}
              active={false}
            />
          )}
          keyExtractor={(item) => item.address}
        />
      ) : (
        <ValidatorItem
          validator={selectedValidator}
          onValidate={async ({ amount, validator }) => {
            if (!isAnyTerraMultisigWallet(wallet)) return;

            invariant(wallet.address, "Expected wallet address to exist.");
            invariant(wallet.currentAdmin, "Expected current admin to exist.");
            setSelectedValidator(null);

            try {
              const { digits } = formatExtendedCoin({
                denom: "uluna",
                amount: "0",
                usdPrice: 0,
              });
              await RequestObiTerraSignAndBroadcastMsg.send({
                id: wallet.id,
                messages: [
                  terra
                    .getStakeMessage({
                      sender: wallet.address,
                      validator: validator.address,
                      amount:
                        parseFloat(amount.replace(",", ".")) * 10 ** digits,
                      chainId: wallet.chain,
                    })
                    .toAmino(),
                ],
                multisig: wallet.currentAdmin,
                wrap: true,
              });
              setSelectedValidator(null);
            } catch (e) {
              console.log(e);
            }
          }}
          active
          onCancel={() => setSelectedValidator(null)}
        />
      )}
    </View>
  );
}

const Container = styled.View({
  backgroundColor: "#272727",
  borderRadius: 7,
  marginTop: 5,
  padding: 10,
});

function ValidatorItem({
  validator,
  onPress,
  active = false,
  onCancel,
  onValidate,
}: {
  validator: ExtendedValidator;
  onPress?: (validator: ExtendedValidator) => void;
  active?: boolean;
  onValidate?: (args: { validator: ExtendedValidator; amount: string }) => void;
  onCancel?: () => void;
}) {
  const { chainStore } = useStore();
  const [amount, setAmount] = useState("");
  const obi =
    validator.address === chainStore.currentTerraChainInformation.obiValidator;
  const promoted = validator.promoted;

  return (
    <Container
      style={
        promoted
          ? {
              borderWidth: 1,
              borderColor: "#437DFF",
            }
          : undefined
      }
    >
      <TouchableOpacity
        disabled={active}
        style={{ flexDirection: "row" }}
        onPress={() => (onPress ? onPress(validator) : {})}
      >
        <View style={{ width: 50, height: 50 }}>
          {obi ? (
            <ObiLogo />
          ) : validator.icon ? (
            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                backgroundColor: "#1a1a1a",
              }}
              source={{
                uri: validator.icon,
              }}
            />
          ) : (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                backgroundColor: "#1a1a1a",
              }}
            />
          )}
        </View>
        <View style={{ marginLeft: 10, justifyContent: "center", flex: 1 }}>
          <Text style={{ color: "white", flexWrap: "wrap" }} numberOfLines={1}>
            {obi ? "Obi Technologies" : validator.label}
          </Text>
          <View>
            <Text style={{ color: "#7E7E7E", fontSize: 9 }} numberOfLines={1}>
              Voting Power {validator.votingPower}% • Commission{" "}
              {validator.commission}%
            </Text>
          </View>
        </View>
        {active && (
          <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity
              style={{ backgroundColor: "white", borderRadius: 32 }}
              onPress={() =>
                onValidate ? onValidate({ validator, amount }) : {}
              }
            >
              <Text
                style={{
                  color: promoted ? "#437DFF" : "#1a1a1a",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                }}
              >
                stake
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
      {active && (
        <View style={{ marginTop: 10, marginRight: 10 }}>
          <Text style={{ color: "white", fontSize: 10, marginBottom: 10 }}>
            AMOUNT
          </Text>
          <View
            style={{
              borderColor: "#fff",
              borderWidth: 1,
              borderRadius: 7,
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View
                style={{
                  width: 36,
                  aspectRatio: 1 / 1,
                  backgroundColor: "#000",
                  borderRadius: 36,
                  margin: 12,
                }}
              />
              <View style={{ justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Luna</Text>
                <Text style={{ color: "#fff", fontWeight: "400" }}>123.45</Text>
              </View>
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <TextInput
                style={{
                  color: "#ffffff",
                  marginRight: 10,
                  fontSize: isSmallScreenNumber(18, 24),
                }}
                placeholder="0"
                placeholderTextColor="#fff"
                textAlign="right"
                onChangeText={(text) => setAmount(text)}
                value={amount}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ alignItems: "center", padding: 10 }}>
            <TouchableOpacity onPress={() => (onCancel ? onCancel() : {})}>
              <Text style={{ color: "#fff" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Container>
  );
}

function MyStake() {
  const { delegations } = useDelegations();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          paddingVertical: 10,
          marginBottom: 10,
          borderBottomColor: "#404040",
          borderBottomWidth: 1,
        }}
      >
        <Text style={{ fontSize: 10, color: "white" }}>Validator</Text>
      </View>
      <FlatList
        data={delegations}
        renderItem={({ item }) => <StakeItem delegation={item} />}
        keyExtractor={(item) => item.validator.address}
      />
    </View>
  );
}

function StakeItem({ delegation }: { delegation: Delegation }) {
  const formatted = formatCoin(delegation.balance);

  return (
    <View
      style={{
        flexDirection: "row",
        height: 50,
        borderBottomColor: "#404040",
        borderBottomWidth: 1,
        marginBottom: 10,
        marginHorizontal: 20,
      }}
    >
      <View style={{ marginLeft: 10, justifyContent: "center" }}>
        <Text style={{ color: "#437dff" }}>{delegation.validator.label}</Text>
        <View>
          <Text style={{ color: "white", fontSize: 14 }}>
            {formatted.amount} {formatted.denom}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            borderRadius: 32,
            justifyContent: "center",
            alignItems: "center",
            ...(isSmallScreen() ? { height: 35 } : {}),
          }}
          onPress={() => {
            Alert.alert("Not implemented yet");
          }}
        >
          <Text
            style={{
              color: "#1a1a1a",
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}
          >
            Unstake
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Unstaking() {
  const { unbondingDelegations } = useUnbondingDelegations();

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          paddingVertical: 10,
          marginBottom: 10,
          borderBottomColor: "#404040",
          borderBottomWidth: 1,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: "white",
            justifyContent: "space-between",
            flexDirection: "row",
            flex: 1,
          }}
        >
          Validator
        </Text>
        <Text style={{ fontSize: 10, color: "white" }}>Release</Text>
      </View>
      <FlatList
        data={unbondingDelegations}
        renderItem={({ item }) => <UnstakeItem unbondingDelegation={item} />}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

function UnstakeItem({
  unbondingDelegation,
}: {
  unbondingDelegation: UnbondingDelegation;
}) {
  const formatted = formatCoin(unbondingDelegation.balance);
  const releaseDate = DateTime.fromJSDate(unbondingDelegation.completionTime);
  const remainingDays = releaseDate.diffNow("days").days;

  return (
    <View
      style={{
        flexDirection: "row",
        height: 50,
        borderBottomColor: "#404040",
        borderBottomWidth: 1,
        marginBottom: 10,
        marginHorizontal: 20,
      }}
    >
      <View style={{ marginLeft: 10, justifyContent: "center" }}>
        <Text style={{ color: "#437dff" }}>
          {unbondingDelegation.validator.label}
        </Text>
        <View>
          <Text style={{ color: "white", fontSize: 14 }}>
            {formatted.amount} {formatted.denom}
          </Text>
        </View>
      </View>
      <View
        style={{ flex: 1, alignItems: "flex-end", justifyContent: "center" }}
      >
        <Text style={{ color: "white" }}>{remainingDays} days</Text>
      </View>
    </View>
  );
}
