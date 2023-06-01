import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useCurrentWallet, useQuery } from "@obi-wallet/headless-ui";
import {
  Beneficiary,
  FlexAccount,
  GatekeeperConfig,
  Sdk,
  SinglesigWallet,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  ImageBackground,
  LayoutAnimation,
  ListRenderItemInfo,
  TouchableOpacity,
  View,
} from "react-native";

import { AccountItem } from "./account-item";
import { PermissionedAddressesContext } from "./permissioned-addresses-context";
import { useStore } from "../../../../contexts";
import { Alert } from "../../../../helpers";
import { UsdBalance } from "../../../../hooks";
import {
  AccountsRoute,
  AccountsStackParamList,
  SettingsRoute,
  useRootNavigation,
} from "../../../../router";
import { Button } from "../../../buttons";
import { SendIcon } from "../../../icons";
import { KeyboardAwareFlatList } from "../../../keyboard-aware-scroll-view";
import { NetworkAccountPickerLayout } from "../../../network-account-picker-layout";
import { Text } from "../../../typography";
import { getGatekeeperConfigDraftId } from "../draft-id";

// TODO:
const KeyRoundIcon = SendIcon;

export type AccountsOverviewScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.AccountsOverview
>;

export const AccountsOverviewScreen = observer<AccountsOverviewScreenProps>(
  function AccountsOverviewScreen() {
    return (
      <NetworkAccountPickerLayout>
        <View style={{ flex: 1, position: "relative" }}>
          <AccountScreenInner />
        </View>
      </NetworkAccountPickerLayout>
    );
  }
);

const AccountScreenInner = observer(function AccountScreenInner() {
  const { configStore, draftsStore } = useStore();
  const isLoop = configStore.isLoop();
  const navigation = useRootNavigation();

  const wallet = useCurrentWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  const { data: permissionedAddresses, refetch } = useQuery(
    Sdk.chainId(wallet.chainId).gatekeeper.permissionedAddressesQuery(
      wallet.proxyAddress
    )
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
            wallet.setCurrentAccountByMeta(null);
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
                <UsdBalance
                  address={wallet.proxyAddress}
                  chainId={wallet.chainId}
                />
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
                const response = await wallet.updateGatekeeperConfig(
                  draft.value
                );
                if (response.approved) {
                  if (response.payload.success) {
                    draft.commit({ original: wallet.gatekeeperConfig });
                    await refetch();
                  } else {
                    Alert.alert(
                      "Error",
                      response.payload.rawLog ?? "Unknown error"
                    );
                  }
                }
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
  const wallet = useCurrentWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  type Account = Beneficiary | FlexAccount | SinglesigWallet;
  interface AccountMeta<T extends Account = Account> {
    type: T["type"];
    id: string;
  }

  const [itemOpened, setItemOpened] = useState<AccountMeta | null>(null);

  type AccountData<T extends Account = Account> = {
    meta: AccountMeta<T>;
    account: T;
    originalAccount: T | undefined;
  };

  const beneficiariesData = draft.value.beneficiaries.map(
    (account): AccountData<Beneficiary> => {
      return {
        meta: {
          type: account.type,
          id: account.address,
        },
        account,
        originalAccount: draft.original.beneficiaries.find(
          (originalAccount) => {
            return originalAccount.address === account.address;
          }
        ),
      };
    }
  );
  const flexAccountsData = draft.value.flexAccounts.map(
    (account): AccountData<FlexAccount> => {
      return {
        meta: {
          type: account.type,
          id: account.address,
        },
        account,
        originalAccount: draft.original.flexAccounts.find((originalAccount) => {
          return originalAccount.address === account.address;
        }),
      };
    }
  );
  const singlesigWalletsData = wallet.singlesigWallets.map(
    (account): AccountData<SinglesigWallet> => {
      return {
        meta: {
          type: account.type,
          id: account.publicKey.value,
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

  const currentAccount = wallet.meta.currentAccount;

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
              wallet.setCurrentAccountByMeta(element.item.meta);
            }}
            active={R.equals(currentAccount, element.item.meta)}
            originalAccount={element.item.originalAccount ?? null}
            account={element.item.account}
            onDelete={() => {
              switch (element.item.account.type) {
                case "beneficiary":
                  draft.value.removeBeneficiary(element.item.account);
                  break;
                case "flex-account":
                  draft.value.removeFlexAccount(element.item.account);
                  break;
                case "singlesig-wallet":
                  wallet.removeSinglesigWallet(element.item.account);
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
