// eslint-disable @typescript-eslint/no-explicit-any
import {
  Key,
  KeyType,
  MultisigKey,
  MultisigWallet,
  ObservableMultisigKey,
  Serialized,
} from "@obi-wallet/sdk";
import * as R from "ramda";
import invariant from "tiny-invariant";

import * as A from "../components/screens/lookup-proxy-wallets/api-types";
import { RecoverFrom } from "../router";
import { Draft, RootStore } from "../stores";

export async function getProxyWalletsCloudflare(publicKey: string) {
  try {
    const response = await fetch(
      `https://proxy-wallets.obiwallet.workers.dev`,
      // `http://127.0.0.1:8787`,
      {
        method: "POST",
        body: JSON.stringify({
          chainId: "secret-4",
          publicKey,
        }),
        headers: {
          "Api-Version": "v1",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
      },
    );
    const proxyWallets = (await response.json()) as unknown[];
    return proxyWallets;
  } catch (e) {
    //probably no wallets
    console.log("cloudflare worker recover error: " + JSON.stringify(e));
    return [];
  }
}

export async function activateRecoveredWalletAndIsUpdateRequired(
  draft: Draft<MultisigKey>,
  recoverFrom: RecoverFrom | undefined,
  store: RootStore,
  selectedWallet: A.SerializedProxyWallet,
): Promise<{
  isUpdateRequired: boolean;
  serializedData: Serialized<MultisigWallet>["data"] | undefined;
}> {
  console.log("activateRecoveredWalletAndIsUpdateRequired()");
  const { unityStore, walletsStore } = store;
  let activeDeviceKey;
  unityStore.getDeviceId
    ? (activeDeviceKey = draft.value.getUsableKeyOfType(KeyType.Unity))
    : (activeDeviceKey = draft.value.getUsableKeyOfType(KeyType.Device));

  const usableKey = draft.value.getUsableKeyOfType(
    recoverFrom === RecoverFrom.Email ? KeyType.EmailRecovery : KeyType.Phone,
  );

  const recoveredPhoneKey = draft.value.getUsableKeyOfType(KeyType.Phone);
  const recoveredEmailKey = draft.value.getUsableKeyOfType(
    KeyType.EmailRecovery,
  );

  invariant(activeDeviceKey, "Device or unity key is required");
  if (recoverFrom === RecoverFrom.Email || recoverFrom === RecoverFrom.Phone) {
    invariant(
      recoveredPhoneKey || recoveredEmailKey,
      "Phone or email key is required",
    );
  }

  const serializedData: Serialized<MultisigWallet>["data"] = {
    chain: draft.value.chainId,
    owner: {
      threshold: parseInt(selectedWallet.owner.threshold, 10),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keys: selectedWallet.owner.keys.map((key): Serialized<typeof Key> => {
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
                R.equals(recoveredPhoneKey.payload.publicKey, key.publicKey),
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
          case KeyType.Unity: {
            return {
              type: KeyType.Unity,
              payload: {
                publicKey: key.publicKey,
              },
            };
          }
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
      }),
      evmSigningAddress: selectedWallet.evmSigningAddress!,
      evmUserContractAddress: selectedWallet.evmUserContractAddress,
    },
    proxyAddress: {
      v: 1,
      address: selectedWallet.proxyAddress.address,
    },
    // TODO: fetch from chain?
    gatekeeperConfig: {
      beneficiaries: [],
      flexAccounts: [],
    },
    singlesigWallets: [],
    currentAccount: null,
    evmSigningAddress: selectedWallet.evmSigningAddress!,
    evmUserContractAddress: selectedWallet.evmUserContractAddress,
  };

  console.log(
    "serialized recovered wallet data: " + JSON.stringify(serializedData),
  );

  if (recoverFrom === RecoverFrom.Email || recoverFrom === RecoverFrom.Phone) {
    return {
      isUpdateRequired: true,
      serializedData,
    };
  }

  try {
    const currentOwner = ObservableMultisigKey.create(
      {
        homeAccountAddress: serializedData.proxyAddress.address,
        evmSigningAddress: serializedData.evmSigningAddress,
        evmUserContractAddress: serializedData.evmUserContractAddress,
        ownerIndex: 0,
      },
      serializedData.chain,
      serializedData.owner,
    );

    draft.commit({ original: currentOwner });
    if (unityStore.getDeviceId) {
      draft.value.setUnityKey(unityStore.getDeviceId);
    } else {
      draft.value.setDeviceKey(activeDeviceKey.payload);
    }
    console.log("recovered draft: " + JSON.stringify(draft.value));
    await walletsStore.createWallet({
      multisigKey: draft.value,
      demoMode: false,
      skipInit: true,
      evmSigningAddressOverride: serializedData.evmSigningAddress,
      evmUserContractAddressOverride: serializedData.evmUserContractAddress,
      homeAccountAddressOverride: serializedData.proxyAddress.address,
    });
    return {
      isUpdateRequired: false,
      serializedData: undefined,
    };
  } catch (e) {
    console.log("createWallet error: " + JSON.stringify(e));
    return {
      isUpdateRequired: true,
      serializedData,
    };
  }
}
