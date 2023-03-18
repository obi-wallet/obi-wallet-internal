import { pubkeyType } from "@cosmjs/amino";
import {
  generateSec256k1KeyPair,
  KeyType,
  ObservableGatekeeperConfig,
  ObservableMultisigKey,
  Sdk,
} from "@obi-wallet/sdk";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";
import { Alert } from "react-native";

import { getBiometricsPublicKey } from "../app/biometrics";
import { useSecurityQuestions } from "../app/screens/components/phone-number/security-question-input";
import { useMultisigWallet, useStore } from "../app/stores";
import { parsePublicKeyTextMessageResponse } from "../app/text-message";
import { getGatekeeperConfigDraftId } from "../screens/accounts/draft-id";

export function mockAction(message: string) {
  return () => {
    Alert.alert(message);
  };
}

const multisigDraftId = "multisigSettingsFixture";
export const MultisigDraft = {
  draftId: multisigDraftId,
  Container: observer<{ children: ReactNode }>(function MultisigDraft({
    children,
  }) {
    const { chainStore, draftsStore } = useStore();
    const draft = draftsStore.get({ id: multisigDraftId });
    const securityQuestions = useSecurityQuestions();

    useEffect(() => {
      (async () => {
        if (!draft) {
          const original = ObservableMultisigKey.empty(chainStore.currentChain);
          original.setKey({
            type: KeyType.Device,
            payload: {
              publicKey: {
                type: pubkeyType.secp256k1,
                value: await getBiometricsPublicKey({
                  demoMode: true,
                }),
              },
            },
          });
          original.setKey({
            type: KeyType.Phone,
            payload: {
              publicKey: {
                type: pubkeyType.secp256k1,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                value: (await parsePublicKeyTextMessageResponse({
                  key: "",
                  demoMode: true,
                }))!,
              },
              phoneNumber: "+1234567890",
              securityQuestion: securityQuestions[0].value,
            },
          });
          draftsStore.create({
            original,
            id: multisigDraftId,
          });
        }
      })();
    }, [draft, chainStore, draftsStore, securityQuestions]);

    return draft ? <>{children}</> : null;
  }),
};

export const GatekeeperConfigDraft = {
  Container: observer<{ children: ReactNode }>(function GatekeeperConfigDraft({
    children,
  }) {
    const { draftsStore } = useStore();
    const wallet = useMultisigWallet();

    useEffect(() => {
      const draftId = getGatekeeperConfigDraftId(wallet);

      function getDraft() {
        return draftsStore.get<ObservableGatekeeperConfig>({
          id: draftId,
        });
      }

      if (!getDraft()) {
        draftsStore.create({
          id: draftId,
          original: wallet.gatekeeperConfig,
        });
      }
      const draft = getDraft();

      (async () => {
        const accounts = [
          ...wallet.gatekeeperConfig.flexAccounts,
          ...wallet.gatekeeperConfig.beneficiaries,
        ];
        if (accounts.length > 0) return;

        const { publicKey, privateKey } = generateSec256k1KeyPair();
        const address = Sdk.chainId(wallet.chain).getAddressOfPublicKey({
          publicKey,
        });

        draft.value.upsertBeneficiary({
          type: "beneficiary",
          meta: {
            name: "Beneficiary Account",
            icon: "",
          },
          address,
          dormancyThreshold: {
            years: 1,
          },
          dripSchedule: {
            rate: 0.05,
            period: {
              years: 1,
            },
          },
        });
        draft.value.upsertFlexAccount({
          type: "flex-account",
          meta: {
            name: "Strict Flex Account",
            icon: "",
          },
          address,
          publicKey,
          privateKey: privateKey,
          spendLimit: null,
          autoSign: null,
        });
        draft.value.upsertFlexAccount({
          type: "flex-account",
          meta: {
            name: "Limited Flex Account",
            icon: "",
          },
          address,
          publicKey,
          privateKey: privateKey,
          spendLimit: {
            period: {
              days: 1,
            },
            amount: 10,
          },
          autoSign: null,
        });
        draft.value.upsertFlexAccount({
          type: "flex-account",
          meta: {
            name: "Unlocked Flex Account",
            icon: "",
          },
          address,
          publicKey,
          privateKey: privateKey,
          spendLimit: {
            period: {
              days: 1,
            },
            amount: 10,
          },
          autoSign: {
            endTime: DateTime.local().plus({ minutes: 30 }).toISO(),
          },
        });

        draft.commit({ original: draft.value });

        await wallet.addSinglesigWallet({
          type: "singlesig-wallet",
          publicKey,
          privateKey: privateKey,
        });
      })();
    }, [draftsStore, wallet]);

    return <>{children}</>;
  }),
};
