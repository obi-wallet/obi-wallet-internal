import {
  createObservableMultisigKey,
  Key,
  KeyType,
  MultisigKey,
  MultisigWallet,
  Serialized,
} from "@obi-wallet/sdk";
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
import { useStore } from "../../app/stores";

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
        chainId={draft.value.chain}
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

          const serializedData: Serialized<typeof MultisigWallet>["data"] = {
            chain: draft.value.chain,
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

          const newOwner = createObservableMultisigKey(
            serializedData.chain,
            serializedData.owner
          );
          draft.commit({ original: newOwner });
          draft.value.setKey({
            type: KeyType.Device,
            payload: newDeviceKey.payload,
          });

          navigation.navigate(OnboardingRoute.RecoverWallet, {
            ...params,
            serializedData,
          });
        }}
      />
    );
  }
);
