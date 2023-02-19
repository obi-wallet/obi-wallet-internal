import { observer } from "mobx-react-lite";
import { View } from "react-native";

import { getGatekeeperConfigDraftId } from "./draft-id";
import { Button } from "../../app/button";
import { useMultisigWallet } from "../../app/stores";

export const AddAccountScreen = observer(function AddAccountScreen() {
  const wallet = useMultisigWallet();
  const draftId = getGatekeeperConfigDraftId(wallet);
  console.log(draftId);

  return (
    <View style={{ marginTop: 100 }}>
      <Button
        flavor="blue"
        label="Create Flex Account"
        onPress={() => {
          console.log("add");
        }}
      />
      <Button
        flavor="blue"
        label="Inheritance"
        onPress={() => {
          console.log("add");
        }}
      />
      <Button
        flavor="blue"
        label="Import Legacy Account"
        onPress={() => {
          console.log("add");
        }}
      />
    </View>
  );
});
