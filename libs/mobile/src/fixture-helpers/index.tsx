import {
  Alert,
  getGatekeeperConfigDraftId,
  getTwilioClient,
  useEnv,
  useSecurityQuestions,
  useStore,
} from "@obi-wallet/common";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import {
  GatekeeperConfig,
  generateSec256k1KeyPair,
  getOrCreateDeviceKeyPair,
  ObservableBeneficiary,
  ObservableFlexAccount,
  ObservableMultisigKey,
  ObservableSinglesigWallet,
  Sdk,
} from "@obi-wallet/sdk";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";
import { useAsyncEffect } from "rooks";

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
    const env = useEnv();

    useAsyncEffect(async () => {
      if (!draft) {
        const original = ObservableMultisigKey.create(chainStore.currentChain);
        let [key, _] = await getOrCreateDeviceKeyPair(true, false, false);
        original.setDeviceKey(
          key
        );
        original.setPhoneKey({
          publicKey: await getTwilioClient({
            demoMode: true,
            env,
          }).parsePublicKeyMagicCodeResponse({
            key: "",
          }),
          phoneNumber: "+1234567890",
          securityQuestion: securityQuestions[0].value,
        });
        draftsStore.create({
          original,
          id: multisigDraftId,
        });
      }
    }, [draft, chainStore, draftsStore, securityQuestions]);

    return draft ? <>{children}</> : null;
  }),
};

export const GatekeeperConfigDraft = {
  Container: observer<{ children: ReactNode }>(function GatekeeperConfigDraft({
    children,
  }) {
    const { draftsStore } = useStore();
    const wallet = useCurrentWallet();

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

      const accounts = [
        ...wallet.gatekeeperConfig.flexAccounts,
        ...wallet.gatekeeperConfig.beneficiaries,
      ];
      if (accounts.length > 0) return;

      const { publicKey, privateKey } = generateSec256k1KeyPair();
      const address = Sdk.chainId(
        wallet.chainId,
      ).transactions.getAddressOfPublicKey(publicKey);

      draft.value.upsertBeneficiary(
        ObservableBeneficiary.create({
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
        }),
      );
      draft.value.upsertFlexAccount(
        ObservableFlexAccount.create({
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
        }),
      );
      draft.value.upsertFlexAccount(
        ObservableFlexAccount.create({
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
        }),
      );
      draft.value.upsertFlexAccount(
        ObservableFlexAccount.create({
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
            endTime: DateTime.local().plus({ minutes: 30 }).toISO()!,
          },
        }),
      );

      draft.commit({ original: draft.value });

      wallet.upsertSinglesigWallet(
        ObservableSinglesigWallet.create({
          type: "singlesig-wallet",
          publicKey,
          privateKey: privateKey,
        }),
      );
    }, [draftsStore, wallet]);

    return <>{children}</>;
  }),
};
