import styled from "@emotion/native";
import { useTheme } from "@emotion/react";
import { faHome } from "@fortawesome/free-solid-svg-icons/faHome";
import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text, TextInput } from "@obi-wallet/common";
import {
  useCurrentWallet,
  useDelegations,
  useRewards,
  useUnbondingDelegations,
  useValidators,
} from "@obi-wallet/headless-ui";
import {
  Delegation,
  EnrichedValidator,
  isTerraChain,
  Token,
  tokenGivenBalances,
  UnbondingDelegation,
  Validator,
} from "@obi-wallet/sdk";
import Fuse from "fuse.js";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import {
  createContext,
  Dispatch,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
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
import { z } from "zod";

import { TokenController } from "../../../../forms";
import { enrichToken, useBalances } from "../../../balances";
import { useCurrentTerraChainInformation, useStore } from "../../../stores";
import { Back } from "../../components/back";
import { CoinIcon } from "../../components/coin-icon";
import { KeyboardAvoidingView } from "../../components/keyboard-avoiding-view";
import { RefreshableFlatList } from "../../components/refreshable-flat-list";
import {
  isSmallScreen,
  isSmallScreenNumber,
} from "../../components/screen-size";

enum StakeTab {
  Validators = "Validators",
  Delegations = "Delegations",
  UnbondingDelegations = "UnbondingDelegations",
}

type StakeState = {
  selectedValidator: string | null;
  selectedTab: StakeTab;
};
const initialStakeState: StakeState = {
  selectedValidator: null,
  selectedTab: StakeTab.Validators,
};
type StakeAction =
  | {
      type: "set-selected-validator";
      payload: Validator;
    }
  | {
      type: "clear-selected-validator";
    }
  | {
      type: "set-selected-tab";
      payload: StakeTab;
    };

function stakeReducer(state: StakeState, action: StakeAction): StakeState {
  switch (action.type) {
    case "clear-selected-validator":
      return { ...state, selectedValidator: null };
    case "set-selected-validator":
      return { ...state, selectedValidator: action.payload.address };
    case "set-selected-tab":
      return { selectedValidator: null, selectedTab: action.payload };
  }
}

const StakeStateContext = createContext<{
  state: StakeState;
  dispatch: Dispatch<StakeAction>;
  // Fine because we set it the value via `StakeStateContext.Provider` in `Stake`
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
}>(null!);

export const Stake = observer(function Stake() {
  const theme = useTheme();
  const SafeArea = useSafeAreaInsets();

  const [state, dispatch] = useReducer(stakeReducer, initialStakeState);

  const children = (
    <StakeStateContext.Provider
      value={{
        state,
        dispatch,
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
    </StakeStateContext.Provider>
  );

  if (state.selectedValidator) {
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

const StakingOptions = observer(function StakingOptions() {
  const wallet = useCurrentWallet();
  const chainId = wallet.chainId;
  const delegations = useDelegations();
  const unbondingDelegations = useUnbondingDelegations();
  const { state, dispatch } = useContext(StakeStateContext);
  const currentTerraChainInformation = useCurrentTerraChainInformation();

  const totalDelegations = {
    id: currentTerraChainInformation.denom,
    rawAmount: R.sum(
      delegations.data?.map((delegation) => {
        return parseInt(delegation.balance.rawAmount, 10);
      }) ?? []
    ).toString(),
  };

  const formattedDelegations = enrichToken({
    chainId,
    token: totalDelegations,
  });
  const delegationsContent = `${formattedDelegations.amount} ${formattedDelegations.denom}`;

  const totalUnbondingDelegations = {
    id: currentTerraChainInformation.denom,
    rawAmount: R.sum(
      unbondingDelegations.data?.map((delegation) => {
        return parseInt(delegation.balance.rawAmount, 10);
      }) ?? []
    ).toString(),
  };

  const formattedUnbondingDelegations = enrichToken({
    chainId,
    token: totalUnbondingDelegations,
  });
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
            borderWidth: state.selectedTab === StakeTab.Validators ? 1 : 0,
            borderColor: "white",
          }}
          disabled={state.selectedTab === StakeTab.Validators}
          onPress={() => {
            dispatch({
              type: "set-selected-tab",
              payload: StakeTab.Validators,
            });
          }}
        >
          <FontAwesomeIcon icon={faHome} color="white" />
        </TouchableOpacity>
        <TabPill
          style={{ flex: 1 }}
          onPress={() => {
            dispatch({
              type: "set-selected-tab",
              payload: StakeTab.Delegations,
            });
          }}
          active={state.selectedTab === StakeTab.Delegations}
          label="My Stake"
          content={delegationsContent}
        />
        <TabPill
          style={{ flex: 1 }}
          onPress={() => {
            dispatch({
              type: "set-selected-tab",
              payload: StakeTab.UnbondingDelegations,
            });
          }}
          active={state.selectedTab === StakeTab.UnbondingDelegations}
          label="Unstaking"
          content={unbondingDelegationsContent}
        />
      </View>
      {getChildren()}
    </View>
  );

  function getChildren() {
    switch (state.selectedTab) {
      case StakeTab.Validators:
        return <Validators />;
      case StakeTab.Delegations:
        return <MyStake />;
      case StakeTab.UnbondingDelegations:
        return <Unstaking />;
    }
  }
});

const TabPill = observer(function TabPill({
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
      disabled={active}
      onPress={onPress}
    >
      <Text style={{ fontSize: 10, color: "white" }}>{label}</Text>
      <Text style={{ fontSize: 15, color: "white" }}>{content}</Text>
    </TouchableOpacity>
  );
});

const Balance = observer(function Balance() {
  const { configStore } = useStore();
  const rewards = useRewards();
  const wallet = useCurrentWallet();

  const isObi = configStore.isObi();

  const totalRewards = rewards.data.total;
  const formattedRewards = enrichToken({
    chainId: wallet.chainId,
    token: totalRewards,
  });

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
      {formattedRewards.amount > 0 ? (
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
          onPress={async () => {
            try {
              await wallet.withdrawRewards();
              await rewards.refetch();
            } catch (e) {
              console.log(e);
            }
          }}
        >
          <Text style={{ color: "#437DFF" }}>Withdraw All Rewards</Text>
        </TouchableHighlight>
      ) : null}
    </View>
  );
});

const Validators = observer(function Validators() {
  const delegations = useDelegations();
  const wallet = useCurrentWallet();

  const [needle, setNeedle] = useState("");
  const { state, dispatch } = useContext(StakeStateContext);

  const validators = useValidators(wallet.chainId);
  const { activeValidators, fuse } = useMemo(() => {
    const activeValidators = validators.data?.filter((validator) => {
      return validator.active;
    });
    const fuse = new Fuse(validators.data ?? [], {
      keys: ["label"],
      threshold: 0,
    });

    return {
      activeValidators,
      fuse,
    };
  }, [validators]);
  const selectedValidator = validators.data?.find((validator) => {
    return validator.address === state.selectedValidator;
  });

  const validatorsToShow = needle
    ? fuse.search(needle).map((result) => result.item)
    : activeValidators;

  const currentTerraChainInformation = useCurrentTerraChainInformation();
  const rawBalances = useBalances({
    address: wallet.address,
    chainId: wallet.chainId,
  });
  const amountToShow = rawBalances.data?.find((balance) => {
    return balance.id === currentTerraChainInformation.denom;
  });

  return (
    <View style={{ flex: 1, marginTop: 10 }}>
      {selectedValidator ? null : (
        <View style={{ flexDirection: "row" }}>
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 15, color: "white" }}>Validators</Text>
            <Text style={{ fontSize: 10, color: "white" }}>
              {activeValidators?.length ?? 0} active validators
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
      {selectedValidator ? (
        <ValidatorItem
          validator={selectedValidator}
          confirmLabel="Stake"
          onConfirm={async ({ validator, token }) => {
            const chainId = wallet.chainId;
            invariant(isTerraChain(chainId), "Expected Terra chain.");

            try {
              await wallet.stake({
                validator: validator.address,
                amount: token,
              });
              dispatch({ type: "clear-selected-validator" });
              await Promise.all([delegations.refetch(), rawBalances.refetch()]);
            } catch (e) {
              console.log(e);
            }
          }}
          active
          onCancel={() => {
            dispatch({ type: "clear-selected-validator" });
          }}
          amountToShow={amountToShow}
        />
      ) : (
        <FlatList
          data={validatorsToShow}
          renderItem={({ item }) => (
            <ValidatorItem
              validator={item}
              onPress={(payload) => {
                dispatch({ type: "set-selected-validator", payload });
              }}
            />
          )}
          keyExtractor={(item) => item.address}
        />
      )}
    </View>
  );
});

const Container = styled.View({
  backgroundColor: "#272727",
  borderRadius: 7,
  marginTop: 5,
  padding: 10,
});

const ValidatorItem = observer(function ValidatorItem({
  validator,
  onPress,
  active = false,
  onCancel,
  onConfirm,
  confirmLabel,
  amountToShow,
}: {
  validator: EnrichedValidator;
  onPress?: (validator: EnrichedValidator) => void;
  active?: boolean;
  onConfirm?: (args: { validator: EnrichedValidator; token: Token }) => void;
  onCancel?: () => void;
  confirmLabel?: string;
  amountToShow?: Token;
}) {
  const currentTerraChainInformation = useCurrentTerraChainInformation();
  const promoted = validator.promoted;

  const balances = amountToShow ? [amountToShow] : [];
  const { control, handleSubmit } = useForm({
    defaultValues: {
      token: {
        id: currentTerraChainInformation.denom,
        amount: "",
      },
    },
    mode: "onChange",
    resolver: zodResolver(
      z.object({
        token: tokenGivenBalances({
          chainId: currentTerraChainInformation.chainId,
          balances,
        }),
      })
    ),
  });

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
          {validator.icon ? (
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
            {validator.label}
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
              onPress={handleSubmit((data) => {
                if (typeof onConfirm !== "function") return;
                onConfirm({
                  validator,
                  // TODO: TypeScript doesn't understand that we receive the processed data here
                  token: data.token as unknown as Token,
                });
              })}
            >
              <Text
                style={{
                  color: promoted ? "#437DFF" : "#1a1a1a",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                }}
              >
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
      {active && (
        <View style={{ marginTop: 10 }}>
          <Controller
            name="token"
            control={control}
            render={({ field, fieldState }) => {
              return (
                <TokenController
                  field={field}
                  fieldState={fieldState}
                  balances={balances.map((token) => {
                    return enrichToken({
                      chainId: currentTerraChainInformation.chainId,
                      token,
                    });
                  })}
                  disableTokenSelect
                />
              );
            }}
          />
          <View style={{ alignItems: "center", padding: 10 }}>
            <TouchableOpacity onPress={() => (onCancel ? onCancel() : {})}>
              <Text style={{ color: "#fff" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Container>
  );
});

const MyStake = observer(function MyStake() {
  const delegations = useDelegations();
  const unbondingDelegations = useUnbondingDelegations();
  const wallet = useCurrentWallet();

  const { state, dispatch } = useContext(StakeStateContext);

  const validators = useValidators(wallet.chainId);
  const selectedValidator = validators.data?.find((validator) => {
    return validator.address === state.selectedValidator;
  });
  const amountToShow = delegations.data?.find((delegation) => {
    return delegation.validator.address === state.selectedValidator;
  })?.balance;

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
      {selectedValidator ? (
        <ValidatorItem
          validator={selectedValidator}
          confirmLabel="Unstake"
          onConfirm={async ({ validator, token }) => {
            const chainId = wallet.chainId;
            invariant(isTerraChain(chainId), "Expected Terra chain.");

            try {
              await wallet.unstake({
                validator: validator.address,
                amount: token,
              });
              dispatch({ type: "clear-selected-validator" });
              await Promise.all([
                delegations.refetch(),
                unbondingDelegations.refetch(),
              ]);
            } catch (e) {
              console.log(e);
            }
          }}
          active
          onCancel={() => {
            dispatch({ type: "clear-selected-validator" });
          }}
          amountToShow={amountToShow}
        />
      ) : (
        <RefreshableFlatList
          data={delegations.data}
          renderItem={({ item }) => <StakeItem delegation={item} />}
          keyExtractor={(item) => item.validator.address}
          refetch={delegations.refetch}
        />
      )}
    </View>
  );
});

const StakeItem = observer(function StakeItem({
  delegation,
}: {
  delegation: Delegation;
}) {
  const wallet = useCurrentWallet();
  const formatted = enrichToken({
    chainId: wallet.chainId,
    token: delegation.balance,
  });
  const { dispatch } = useContext(StakeStateContext);

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
            dispatch({
              type: "set-selected-validator",
              payload: delegation.validator,
            });
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
});

const Unstaking = observer(function Unstaking() {
  const unbondingDelegations = useUnbondingDelegations();

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
      <RefreshableFlatList
        data={unbondingDelegations.data}
        renderItem={({ item }) => <UnstakeItem unbondingDelegation={item} />}
        keyExtractor={(item, index) => index.toString()}
        refetch={unbondingDelegations.refetch}
      />
    </View>
  );
});

const UnstakeItem = observer(function UnstakeItem({
  unbondingDelegation,
}: {
  unbondingDelegation: UnbondingDelegation;
}) {
  const wallet = useCurrentWallet();
  const formatted = enrichToken({
    chainId: wallet.chainId,
    token: unbondingDelegation.balance,
  });
  const releaseDate = DateTime.fromJSDate(unbondingDelegation.completionTime);
  const remainingDays = Math.ceil(releaseDate.diffNow("days").days);

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
});
