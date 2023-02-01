import { pubkeyType } from "@cosmjs/amino";
import { MultisigKey } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";
import { Alert } from "react-native";

import { getBiometricsPublicKey } from "../app/biometrics";
import { useSecurityQuestions } from "../app/screens/components/phone-number/security-question-input";
import { useStore } from "../app/stores";
import { parsePublicKeyTextMessageResponse } from "../app/text-message";

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
    const { draftsStore } = useStore();
    const draft = draftsStore.get({ id: multisigDraftId });
    const securityQuestions = useSecurityQuestions();

    useEffect(() => {
      (async () => {
        if (!draft) {
          const original = new MultisigKey();
          original.setDeviceKey({
            publicKey: {
              type: pubkeyType.secp256k1,
              value: await getBiometricsPublicKey({ demoMode: true }),
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
    }, [draft, draftsStore]);

    return draft ? <>{children}</> : null;
  }),
};
