import {
  OnboardingRoute,
  OnboardingStackParamList,
  useRootNavigation,
  useStore,
} from "@obi-wallet/common";
import {
  Key,
  KeyType,
  MultisigKey,
  MultisigWallet,
  ObservableMultisigKey,
  Serialized,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { Lookup } from "../../app/screens/onboarding/lookup-proxy-wallets/lookup";

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

    const phoneKey = draft.value.getUsableKeyOfType(KeyType.Phone);

    invariant(phoneKey, "Phone key is required");

    return (
      <Lookup
        chainId={draft.value.chainId}
        publicKey={phoneKey.publicKey.value}
        onCancel={() => {
          navigation.goBack();
        }}
        onSelect={async (serializedProxyWallet) => {
          const newDeviceKey = draft.value.getUsableKeyOfType(KeyType.Device);
          const recoveredPhoneKey = draft.value.getUsableKeyOfType(
            KeyType.Phone
          );

          invariant(newDeviceKey, "Device key is required");
          invariant(recoveredPhoneKey, "Phone key is required");

          const serializedData: Serialized<MultisigWallet>["data"] = {
            chain: draft.value.chainId,
            owner: {
              threshold: parseInt(serializedProxyWallet.owner.threshold, 10),
              keys: serializedProxyWallet.owner.keys.map(
                (key): Serialized<typeof Key> => {
                  switch (key.type) {
                    case KeyType.Device: {
                      return {
                        type: KeyType.Device,
                        payload: {
                          publicKey: key.publicKey,
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
                          publicKey: key.publicKey,
                        },
                      };
                    case KeyType.Social:
                      return {
                        type: KeyType.Social,
                        payload: {
                          publicKey: key.publicKey,
                        },
                      };
                    case KeyType.Cloud:
                    case KeyType.Nfc:
                      return {
                        payload: {
                          type: key.type,
                          publicKey: key.publicKey,
                        },
                      };
                    case KeyType.Email:
                      return {
                        payload: {
                          type: key.type,
                          publicKey: key.publicKey,
                        },
                      };
                  }
                }
              ),
            },
            proxyAddress: {
              v: 1,
              address: serializedProxyWallet.proxyAddress.address,
            },
            // TODO: fetch from chain?
            gatekeeperConfig: {
              beneficiaries: [],
              flexAccounts: [],
            },
            singlesigWallets: [],
            currentAccount: null,
          };

          const newOwner = ObservableMultisigKey.create(
            serializedData.chain,
            serializedData.owner
          );
          draft.commit({ original: newOwner });
          draft.value.setDeviceKey(newDeviceKey.payload.publicKey);

          navigation.navigate(OnboardingRoute.RecoverWallet, {
            ...params,
            serializedData,
          });
        }}
      />
    );
  }
);
