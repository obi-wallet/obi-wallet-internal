import { pubkeyType } from "@cosmjs/amino";
import {
  GatekeeperConfig,
  generateSec256k1KeyPair,
  MultisigKey,
  terra,
} from "@obi-wallet/common";
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
          const original = new MultisigKey({ chain: chainStore.currentChain });
          original.setDeviceKey({
            publicKey: {
              type: pubkeyType.secp256k1,
              value: await getBiometricsPublicKey({
                demoMode: true,
              }),
            },
          });
          original.setPhoneKey({
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
        return draftsStore.get<GatekeeperConfig>({
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

      const accounts = wallet.getAccounts(draft.value);
      if (accounts.ids.length > 0) return;

      const { publicKey, privateKey } = generateSec256k1KeyPair();
      const address = terra.getAddress({
        publicKey: {
          type: "tendermint/PubKeySecp256k1",
          value: publicKey,
        },
      });

      draft.value.addBeneficiary({
        type: "beneficiary",
        meta: {
          name: "Beneficiary Account",
          icon: "",
        },
        address: "terra1a",
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
      draft.value.addFlexAccount({
        type: "flex-account",
        meta: {
          name: "Flex Account",
          icon: "",
        },
        address,
        publicKey: {
          type: "tendermint/PubKeySecp256k1",
          value: publicKey,
        },
        privateKey: privateKey,
        spendLimit: null,
        autoSign: null,
      });
      wallet.addSinglesigWallet({
        type: "singlesig-wallet",
        publicKey: {
          type: "tendermint/PubKeySecp256k1",
          value: publicKey,
        },
        privateKey: privateKey,
      });
    }, [draftsStore, wallet]);

    return <>{children}</>;
  }),
};
