import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  EntityId,
  GatekeeperConfig,
  RequestObiTerraSignAndBroadcastMsg,
  terra,
  Text,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { isTxError } from "@terra-money/terra.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  Alert,
  FlatList,
  ImageBackground,
  LayoutAnimation,
  Platform,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
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
import { AccountsRoute, AccountsStackParamList } from "../accounts-stack";
import { getGatekeeperConfigDraftId } from "../draft-id";

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
  const navigation = useRootNavigation();

  const wallet = useMultisigWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  const { data: gatekeeperContractAddresses } = useQuery(
    getGatekeeperContractAddressesQuery({
      chainId: wallet.chain,
      address: wallet.proxyAddress.address,
    })
  );
  const spendLimitGatekeeper =
    gatekeeperContractAddresses?.spendLimitGatekeeper;
  const { data: permissionedAddresses } = useQuery(
    getPermissionedAddressesQuery({
      chainId: wallet.chain,
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
          onPress={async () => {
            await wallet.setCurrentAccount(null);
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
                top: 6,
                left: 6,
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
                <UsdBalance address={wallet.proxyAddress.address} />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <AccountsList />
        </View>
        {draft.isDirty ? (
          <View style={{ margin: 15 }}>
            <Button
              flavor="blue"
              label="Confirm"
              onPress={async () => {
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

                if (isTxError(response)) {
                  Alert.alert("Error", response.raw_log ?? "Unknown error");
                  return;
                }

                await wallet.setGatekeeperConfig(draft.value);
                draft.commit({ original: wallet.gatekeeperConfig });
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

  const accounts = wallet.getAccounts(draft.value);
  const [itemOpened, setItemOpened] = useState<EntityId | null>(null);

  const activeAccount = wallet.currentAccountId;
  const setActiveAccount = async (id: EntityId) => {
    await wallet.setCurrentAccount(id);
  };

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
            onSetActive={async () => {
              await setActiveAccount(element.item.id);
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
