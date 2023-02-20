import { GatekeeperConfig } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { Button } from "../../app/button";
import { useMultisigWallet, useStore } from "../../app/stores";

export type CreateBeneficiaryAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.CreateBeneficiaryAccount
>;

export const CreateBeneficiaryAccountScreen =
  observer<CreateBeneficiaryAccountScreenProps>(
    function CreateBeneficiaryAccountScreen({ navigation }) {
      const { draftsStore } = useStore();
      const wallet = useMultisigWallet();
      const gatekeeperConfig = draftsStore.get<GatekeeperConfig>({
        id: getGatekeeperConfigDraftId(wallet),
      });

      return (
        <View style={{ marginTop: 100 }}>
          <Button
            flavor="blue"
            label="Create Beneficiary Account"
            onPress={() => {
              gatekeeperConfig.value.addBeneficiary({
                meta: {
                  icon: "",
                  name: "name",
                },
                address: "0x123",
                dormancyThreshold: {
                  years: 1,
                },
                dripSchedule: {
                  rate: 0.01,
                  period: {
                    months: 1,
                  },
                },
              });

              navigation.navigate(AccountsRoute.AccountsOverview);
            }}
          />
        </View>
      );
    }
  );
