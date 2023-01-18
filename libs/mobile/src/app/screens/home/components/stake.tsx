import styled from "@emotion/native";
import { useTheme } from "@emotion/react";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  Delegation,
  ExtendedValidator,
  Text,
  TextInput,
  UnbondingDelegation,
} from "@obi-wallet/common";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleProp,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { GestureResponderEvent } from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  formatCoin,
  useDelegations,
  useUnbondingDelegations,
  useValidators,
} from "../../../balances";
import { useStore } from "../../../stores";
import { Back } from "../../components/back";
import {
  isSmallScreen,
  isSmallScreenNumber,
} from "../../components/screen-size";
import ObiLogo from "../../settings/assets/obi-logo.svg";

export const Stake = observer(() => {
  const theme = useTheme();
  const SafeArea = useSafeAreaInsets();
  const { refreshDelegations } = useDelegations();
  const { refreshUnbondingDelegations } = useUnbondingDelegations();
  const { refreshValidators } = useValidators();

  useEffect(() => {
    void refreshDelegations();
    void refreshUnbondingDelegations();
    void refreshValidators();
  }, [refreshDelegations, refreshUnbondingDelegations, refreshValidators]);

  return (
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
  );
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
  // const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { configStore } = useStore();
  const isObi = configStore.isObi();
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
        <Image source={require("../assets/lunaIcon.png")} />
        <Text
          style={{
            fontSize: 24,
            color: "white",
            fontWeight: "400",
            marginLeft: 10,
          }}
        >
          TODO
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
          console.log("withdraw");
        }}
      >
        <Text style={{ color: "#437DFF" }}>Withdraw All Rewards</Text>
      </TouchableHighlight>
    </View>
  );
});

function Validators() {
  const { validators } = useValidators();

  console.log(validators.length);

  return (
    <View style={{ flex: 1, marginTop: 10 }}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 15, color: "white" }}>Validators</Text>
          <Text style={{ fontSize: 10, color: "white" }}>
            130 active validators
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            style={{
              borderColor: "white",
              borderRadius: 32,
              borderWidth: 1,
              padding: 10,
            }}
            placeholder="Search"
          />

          <FontAwesomeIcon
            icon={faSearch}
            style={{ position: "absolute", right: 10, top: 12, color: "white" }}
          />
        </View>
      </View>
      <ObiValidator />
      <FlatList
        data={validators}
        renderItem={({ item }) => <ValidatorContainer validator={item} />}
        keyExtractor={(item, index) => item.address}
      />
    </View>
  );
}

const Container = styled.TouchableOpacity({
  backgroundColor: "#272727",
  borderRadius: 7,
  marginTop: 5,
  padding: 10,
});

function ObiValidator() {
  return null;
  return (
    <Container
      style={{
        borderWidth: 1,
        borderColor: "#437DFF",
      }}
    >
      {/*<ValidatorItem obi validator={{}/>*/}
    </Container>
  );
}

// TODO:
function ValidatorContainer({ validator }: { validator: ExtendedValidator }) {
  return (
    <Container>
      <ValidatorItem validator={validator} />
    </Container>
  );
}

function ValidatorItem({
  obi,
  validator,
}: {
  obi?: boolean;
  validator: ExtendedValidator;
}) {
  console.log(validator.icon);

  return (
    <View style={{ flexDirection: "row" }}>
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
          {obi ? "Obi Technologies" : validator.label}a
        </Text>
        <View>
          <Text style={{ color: "#7E7E7E", fontSize: 9 }} numberOfLines={1}>
            Voting Power TODO • Commission {validator.commission}%
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <TouchableOpacity
          style={{ backgroundColor: "white", borderRadius: 32 }}
        >
          <Text
            style={{
              color: obi ? "#437DFF" : "#1a1a1a",
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}
          >
            stake
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
