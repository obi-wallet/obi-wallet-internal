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

import { useRootNavigation } from "../../app/root-stack";
import { Lookup } from "../../app/screens/onboarding/lookup-proxy-wallets/lookup";
import {
  OnboardingRoute,
  OnboardingStackParamList,
  RecoverFrom,
} from "../../app/screens/onboarding/onboarding-stack";
import { useStore } from "../../app/stores";
import { KeyRoute } from "../keys";

export type LookupProxyWalletsScreen = NativeStackScreenProps<
  OnboardingStackParamList,
  OnboardingRoute.LookupProxyWallets,
  RecoverFrom
>;

export const LookupProxyWalletsScreen = observer<LookupProxyWalletsScreen>(
  function LookupProxyWalletsScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;
    const { draftsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({
      id: params.draftId,
    });
    if (!navigation.isFocused()) return null;

    const usableKey = draft.value.getUsableKeyOfType(
      params.RecoverFrom === RecoverFrom.Email
        ? KeyType.EmailRecovery
        : KeyType.Phone
    );
    if (!usableKey) {
      console.error("No usable key found");
      return null;
    }
    const publicKey = usableKey?.payload.publicKey.value;

    return (
      <Lookup
        chainId={draft.value.chainId}
        publicKey={publicKey}
        onCancel={() => {
          navigation.goBack();
        }}
        onSelect={async (serializedProxyWallet) => {
          const newDeviceKey = draft.value.getUsableKeyOfType(KeyType.Device);
          const recoveredPhoneKey = draft.value.getUsableKeyOfType(
            KeyType.Phone
          );
          const recoveredEmailKey = draft.value.getUsableKeyOfType(
            KeyType.EmailRecovery
          );

          invariant(newDeviceKey, "Device key is required");
          invariant(
            recoveredPhoneKey || recoveredEmailKey,
            "Phone or Email key is required"
          );

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
                    case KeyType.Phone: {
                      if (recoveredPhoneKey) {
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
                      } else {
                        return {
                          payload: {
                            type: key.type,
                            publicKey: key.publicKey,
                          },
                        };
                      }
                    }
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
                      if (
                        recoveredEmailKey &&
                        usableKey?.type === KeyType.EmailRecovery
                      ) {
                        return {
                          type: KeyType.EmailRecovery,
                          payload: {
                            publicKey: key.publicKey,
                            privateKey: usableKey.payload.privateKey,
                          },
                        };
                      } else {
                        return {
                          payload: {
                            type: key.type,
                            publicKey: key.publicKey,
                          },
                        };
                      }
                    default:
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

          try {
            const currentOwner = ObservableMultisigKey.create(
              serializedData.chain,
              serializedData.owner
            );

            draft.commit({ original: currentOwner });
            const newOwner = draft.value;
            draft.value.setDeviceKey(newDeviceKey.payload.publicKey);
            if (recoveredEmailKey) {
              newOwner.removeKeyOfType(KeyType.EmailRecovery);

              navigation.navigate(KeyRoute.EmailKey, {
                ...params,
                serializedData,
              });
              return;
            }

            navigation.navigate(OnboardingRoute.RecoverWallet, {
              ...params,
              serializedData,
            });
          } catch (e) {
            console.log(e);
          }
        }}
      />
    );
  }
);
