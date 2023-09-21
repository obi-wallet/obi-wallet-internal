import {
  Key,
  KeyType,
  MultisigKey,
  MultisigWallet,
  ObservableMultisigKey,
  ObservableMultisigWallet,
  Serialized,
  createGatekeeperConfig,
} from "@obi-wallet/sdk";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { Lookup } from "./lookup";
import { useStore } from "../../../contexts";
import {
  KeyRoute,
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

    const { draftsStore, unityStore, walletsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({
      id: params.draftId,
    });

    const usableKey = draft.value.getUsableKeyOfType(
      params.recoverFrom === RecoverFrom.Email
        ? KeyType.EmailRecovery
        : KeyType.Phone,
    );
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
        onSelect={async (serializedProxyWallet) => {
          let activeDeviceKey;
          unityStore.getDeviceId
          ? activeDeviceKey = draft.value.getUsableKeyOfType(KeyType.Unity)
          : activeDeviceKey = draft.value.getUsableKeyOfType(KeyType.Device)

          const recoveredPhoneKey = draft.value.getUsableKeyOfType(
            KeyType.Phone,
          );
          const recoveredEmailKey = draft.value.getUsableKeyOfType(
            KeyType.EmailRecovery,
          );

          invariant(activeDeviceKey, "Device key is required");
          /* invariant(
            recoveredPhoneKey || recoveredEmailKey,
            "Phone or email key is required",
          ); */

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
                      if (recoveredPhoneKey) {
                        invariant(
                          R.equals(
                            recoveredPhoneKey.payload.publicKey,
                            key.publicKey,
                          ),
                          "Recovered phone key must match the one in the proxy wallet",
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
                },
              ),
              evmSigningAddress: serializedProxyWallet.evmSigningAddress,
              evmUserContractAddress: serializedProxyWallet.evmUserContractAddress,
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
            evmSigningAddress: serializedProxyWallet.evmSigningAddress,
            evmUserContractAddress: serializedProxyWallet.evmUserContractAddress,
          };

          try {
            const currentOwner = ObservableMultisigKey.create(
              {
                homeAccountAddress: serializedData.proxyAddress.address,
                evmSigningAddress: serializedData.evmSigningAddress,
                evmUserContractAddress: serializedData.evmUserContractAddress,
                ownerIndex: 0
              },
              serializedData.chain,
              serializedData.owner,
            );

            draft.commit({ original: currentOwner });
            const newOwner = draft.value;
            draft.value.setDeviceKey(activeDeviceKey.payload);
            if (recoveredEmailKey) {
              newOwner.removeKeyOfType(KeyType.EmailRecovery);

              navigation.navigate(KeyRoute.EmailKey, {
                ...params,
                serializedData,
              });
              return;
            }
            const newWallet = await walletsStore.createWallet({
              multisigKey: draft.value,
              demoMode: params.demoMode,
              skipInit: true,
              evmSigningAddressOverride: serializedData.evmSigningAddress,
              evmUserContractAddressOverride: serializedData.evmUserContractAddress,
              homeAccountAddressOverride: serializedData.proxyAddress.address
            });

            /*navigation.navigate(OnboardingRoute.RecoverWallet, {
              ...params,
              serializedData,
            });*/
          } catch (e) {
            console.log(e);
          }
        }}
      />
    );
  },
);
