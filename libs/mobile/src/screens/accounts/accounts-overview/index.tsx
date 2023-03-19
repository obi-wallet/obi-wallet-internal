import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  Beneficiary,
  FlexAccount,
  RequestObiSignAndBroadcastTerraTransactionMsg,
  SinglesigWallet,
  terra,
  Text,
} from "@obi-wallet/common";
import { GatekeeperConfig, TerraChain } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isTxError } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Alert,
  ImageBackground,
  LayoutAnimation,
  ListRenderItemInfo,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import invariant from "tiny-invariant";

import { AccountItem } from "./account-item";
import KeyRoundIcon from "./assets/key-round-icon.svg";
import { PermissionedAddressesContext } from "./permissioned-address-context";
import { UsdBalance } from "../../../app/balances";
import { Button } from "../../../app/button";
import { useRootNavigation } from "../../../app/root-stack";
import { Background } from "../../../app/screens/components/background";
import { NetworkAccountPickerLayout } from "../../../app/screens/components/network-account-picker-layout";
import { SettingsRoute } from "../../../app/screens/settings/settings-stack";
import { useMultisigWallet, useStore } from "../../../app/stores";
import {
  getGatekeeperContractAddressesQuery,
  getPermissionedAddressesQuery,
} from "../../../queries/gatekeeper";
import { useQuery } from "../../../queries/helpers";
import { AccountsRoute, AccountsStackParamList } from "../accounts-stack";
import { getGatekeeperConfigDraftId } from "../draft-id";

export type AccountsOverviewScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.AccountsOverview
>;

export const AccountsOverviewScreen = observer<AccountsOverviewScreenProps>(
  function AccountsOverviewScreen() {
    return (
      <>
        <Background />
        <NetworkAccountPickerLayout>
          <View style={{ flex: 1, position: "relative" }}>
            <AccountScreenInner />
          </View>
        </NetworkAccountPickerLayout>
      </>
    );
  }
);

const AccountScreenInner = observer(function AccountScreenInner() {
  const { configStore, draftsStore } = useStore();
  const isLoop = configStore.isLoop();
  const navigation = useRootNavigation();

  const wallet = useMultisigWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  const { data: gatekeeperContractAddresses } = useQuery(
    getGatekeeperContractAddressesQuery({
      chainId: wallet.chainId,
      address: wallet.proxyAddress,
    })
  );
  const spendLimitGatekeeper =
    gatekeeperContractAddresses?.spendLimitGatekeeper;
  const sessionKeyGatekeeper =
    gatekeeperContractAddresses?.sessionKeyGatekeeper;

  const { data: permissionedAddresses, refetch } = useQuery(
    getPermissionedAddressesQuery({
      chainId: wallet.chainId,
      spendLimitGatekeeper,
    })
  );

  return (
    <PermissionedAddressesContext.Provider value={permissionedAddresses}>
      <View style={{ paddingHorizontal: 10, flex: 1 }}>
        <TouchableOpacity
          style={{
            backgroundColor: isLoop ? "#1C0C3F" : "#437DFF",
            borderRadius: 16,
          }}
          onPress={() => {
            wallet.setCurrentAccount(null);
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
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 999,
              }}
              hitSlop={{ top: 20, left: 20, right: 20, bottom: 20 }}
              onPress={() => {
                navigation.navigate(SettingsRoute.MultisigSettings);
              }}
            >
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
                <UsdBalance address={wallet.proxyAddress} />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <AccountsList />
        </View>
        {draft.isDirty ? (
          <View
            style={{
              margin: 5,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#FF2222",
                padding: 16,
                borderRadius: 100,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => {
                draft.reset();
              }}
            >
              <FontAwesomeIcon icon={faTimes} style={{ color: "#F6F5FF" }} />
            </TouchableOpacity>
            <Button
              flavor="blue"
              label="Save Changes"
              buttonStyle={{ flex: 1, margin: 10 }}
              onPress={async () => {
                invariant(
                  spendLimitGatekeeper,
                  "Spend limit gatekeeper address is not set"
                );
                invariant(
                  sessionKeyGatekeeper,
                  "Session key gatekeeper address is not set"
                );

                const messages = terra.getUpdateGatekeeperMessages({
                  currentGatekeeperConfig: draft.original,
                  newGatekeeperConfig: draft.value,
                  proxyAddress: wallet.owner.address,
                  spendLimitGatekeeper,
                  sessionKeyGatekeeper,
                });

                const response =
                  await RequestObiSignAndBroadcastTerraTransactionMsg.send({
                    chain: wallet.chainId as TerraChain,
                    messages: messages.map((message) => message.toAmino()),
                    demoMode: wallet.isDemo,
                    cancelable: true,
                    multisigKey: wallet.owner.toJSON(),
                  });

                if (isTxError(response)) {
                  Alert.alert("Error", response.raw_log ?? "Unknown error");
                  return;
                }

                wallet.setGatekeeperConfig(draft.value);
                draft.commit({ original: wallet.gatekeeperConfig });

                await refetch();
              }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#437DFF",
                padding: 16,
                borderRadius: 100,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => {
                navigation.navigate(AccountsRoute.AddAccount);
              }}
            >
              <FontAwesomeIcon icon={faPlus} style={{ color: "#F6F5FF" }} />
            </TouchableOpacity>
          </View>
        ) : (
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
        )}
      </View>
    </PermissionedAddressesContext.Provider>
  );
});

const AccountsList = observer(function AccountsList() {
  const { draftsStore } = useStore();
  const wallet = useMultisigWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  type Account = Beneficiary | FlexAccount | SinglesigWallet;
  interface AccountMeta<T extends Account = Account> {
    type: T["type"];
    index: number;
  }

  const [itemOpened, setItemOpened] = useState<AccountMeta | null>(null);

  type AccountData<T extends Account = Account> = {
    meta: AccountMeta<T>;
    account: T;
    originalAccount: T | undefined;
  };

  const beneficiariesData = draft.value.beneficiaries.map(
    (account, index): AccountData<Beneficiary> => {
      return {
        meta: {
          type: account.type,
          index,
        },
        account,
        originalAccount: wallet.gatekeeperConfig.beneficiaries.find(
          (originalAccount) => {
            return originalAccount.address === account.address;
          }
        ),
      };
    }
  );
  const flexAccountsData = draft.value.flexAccounts.map(
    (account, index): AccountData<FlexAccount> => {
      return {
        meta: {
          type: account.type,
          index,
        },
        account,
        originalAccount: wallet.gatekeeperConfig.flexAccounts.find(
          (originalAccount) => {
            return originalAccount.address === account.address;
          }
        ),
      };
    }
  );
  const singlesigWalletsData = wallet.singlesigWallets.map(
    (account, index): AccountData<SinglesigWallet> => {
      return {
        meta: {
          type: account.type,
          index,
        },
        account,
        originalAccount: account,
      };
    }
  );

  const data = [
    ...beneficiariesData,
    ...flexAccountsData,
    ...singlesigWalletsData,
  ];

  return (
    <KeyboardAwareFlatList
      viewIsInsideTabBar
      data={data}
      renderItem={(element: ListRenderItemInfo<(typeof data)[0]>) => {
        return (
          <AccountItem
            onOpenToggle={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              R.equals(itemOpened, element.item.meta)
                ? setItemOpened(null)
                : setItemOpened(element.item.meta);
            }}
            isOpen={R.equals(itemOpened, element.item.meta)}
            onSetActive={() => {
              if (element.item.meta.type === "beneficiary") return;
              wallet.setCurrentAccount(element.item.meta);
            }}
            active={R.equals(wallet.meta.currentAccount, element.item.meta)}
            originalAccount={element.item.originalAccount ?? null}
            account={element.item.account}
            onDelete={() => {
              switch (element.item.account.type) {
                case "beneficiary":
                  draft.value.removeBeneficiaryByAddress({
                    address: element.item.account.address,
                  });
                  break;
                case "flex-account":
                  draft.value.removeFlexAccountByAddress({
                    address: element.item.account.address,
                  });
                  break;
                case "singlesig-wallet":
                  wallet.removeSinglesigWallet(element.item.account);
                  break;
              }
            }}
            onChange={(account) => {
              switch (account.type) {
                case "beneficiary":
                  draft.value.upsertBeneficiary(account);
                  break;
                case "flex-account":
                  draft.value.upsertFlexAccount(account);
                  break;
                case "singlesig-wallet":
                  wallet.upsertSinglesigWallet(account);
                  break;
              }
            }}
          />
        );
      }}
      keyExtractor={(item) => JSON.stringify(item.meta)}
    />
  );
});
