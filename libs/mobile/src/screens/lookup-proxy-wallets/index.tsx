import {
  KeyType,
  MultisigKey,
  MultisigKeySerializedData,
} from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { useRootNavigation } from "../../app/root-stack";
import { Lookup } from "../../app/screens/onboarding/lookup-proxy-wallets/lookup";
import {
  OnboardingRoute,
  OnboardingStackParamList,
} from "../../app/screens/onboarding/onboarding-stack";
import { SettingsRoute } from "../../app/screens/settings/settings-stack";
import { useStore } from "../../app/stores";

export type LookupProxyWalletsScreen = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.LookupProxyWallets
>;

export const LookupProxyWalletsScreen = observer<LookupProxyWalletsScreen>(
  function LookupProxyWalletsScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    const { draftsStore, walletsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: params.draftId });

    const phoneKey = draft.value.keys.find((key) => key.type === KeyType.Phone);

    invariant(phoneKey, "Phone key is required");

    return (
      <Lookup
        chainId={draft.value.chain}
        publicKey={phoneKey.payload.publicKey.value}
        onCancel={() => {
          navigation.goBack();
        }}
        onSelect={async (serializedProxyWallet) => {
          const newDeviceKey = draft.value.getKeyOfType(KeyType.Device);
          const recoveredPhoneKey = draft.value.getKeyOfType(KeyType.Phone);

          invariant(newDeviceKey, "Device key is required");
          invariant(recoveredPhoneKey, "Phone key is required");

          const serializedData = {
            chain: draft.value.chain,
            owner: {
              threshold: parseInt(serializedProxyWallet.owner.threshold, 10),
              keys: serializedProxyWallet.owner.keys.map(
                (key): MultisigKeySerializedData.SerializedKey => {
                  // TODO: When adding new keys, we probably need to map them to a "dummy" key type to mark the key as not recovered yet.
                  // Then we remove all keys with dummy type from draft.value and redirect the user to the recovery screen.
                  // Dummy keys then get options "recover" or "remove".

                  switch (key.type) {
                    case KeyType.Device: {
                      return {
                        type: KeyType.Device,
                        payload: {
                          publicKey:
                            key.publicKey as MultisigKeySerializedData.SerializedDeviceKey["payload"]["publicKey"],
                        },
                      };
                    }
                    case KeyType.Phone:
                      invariant(
                        R.equals(
                          recoveredPhoneKey.payload.publicKey,
                          key.publicKey
                        ),
                        "Recovered phone key must match the one in the proxy wallet"
                      );
                      return {
                        type: KeyType.Phone,
                        payload: {
                          ...recoveredPhoneKey.payload,
                          publicKey:
                            key.publicKey as MultisigKeySerializedData.SerializedDeviceKey["payload"]["publicKey"],
                        },
                      };
                    case KeyType.Social:
                      return {
                        type: KeyType.Social,
                        payload: {
                          publicKey:
                            key.publicKey as MultisigKeySerializedData.SerializedDeviceKey["payload"]["publicKey"],
                        },
                      };
                  }
                }
              ),
            },
            proxyAddress: serializedProxyWallet.proxyAddress,
          };

          const wallet = params.demoMode
            ? await walletsStore.addMultisigDemoWallet(serializedData)
            : await walletsStore.addMultisigWallet(serializedData);

          draftsStore.create({
            original: wallet.owner,
            value: draft.value,
          });

          navigation.navigate(SettingsRoute.MultisigSettings);
        }}
      />
    );
  }
);
