import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { getGatekeeperConfigDraftId } from "./draft-id";
import { Button } from "../../app/button";
import { useMultisigWallet } from "../../app/stores";

export const AccountsOverviewScreen = observer(
  function AccountsOverviewScreen() {
    const wallet = useMultisigWallet();
    const draftId = getGatekeeperConfigDraftId(wallet);
    console.log(draftId);

    return (
      <View style={{ marginTop: 100 }}>
        <Button
          flavor="blue"
          label="Add"
          onPress={() => {
            console.log("add");
          }}
        />
      </View>
    );
  }
);
