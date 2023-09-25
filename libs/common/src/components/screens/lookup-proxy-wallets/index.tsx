import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import invariant from "tiny-invariant";

import { Lookup } from "./lookup";
import { useStore } from "../../../contexts";
import {
  OnboardingRoute,
  OnboardingStackParamList,
  RecoverFrom,
  useRootNavigation,
} from "../../../router";

export { Lookup };

export type LookupProxyWalletsScreen = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.LookupProxyWallets
>;

export const LookupProxyWalletsScreen = observer<LookupProxyWalletsScreen>(
  function LookupProxyWalletsScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    const { draftsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({
      id: params.draftId,
    });

    let recoverType: KeyType;
    switch (params.recoverFrom) {
      case RecoverFrom.Email:
        recoverType = KeyType.Email;
        break;
      case RecoverFrom.Phone:
        recoverType = KeyType.Phone;
        break;
      case RecoverFrom.Device:
        recoverType = KeyType.Device;
        break;
      case RecoverFrom.Unity:
        recoverType = KeyType.Unity;
        break;
    }
    console.log("Looking for key type " + recoverType);
    const usableKey = draft.value.getUsableKeyOfType(recoverType);
    invariant(usableKey, "No usable key found");
    const publicKey = usableKey.payload.publicKey.value;

    if (!navigation.isFocused()) return null;

    return (
      <Lookup
        chainId={draft.value.chainId}
        publicKey={publicKey}
        draftId={params.draftId}
        recoverFrom={params.recoverFrom}
        onCancel={() => {
          navigation.goBack();
        }}
        onSelect={async () => {
          // noop
        }}
      />
    );
  },
);
