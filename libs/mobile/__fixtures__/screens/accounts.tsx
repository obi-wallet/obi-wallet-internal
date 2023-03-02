import {
  GatekeeperConfig,
  generateSec256k1KeyPair,
  terra,
} from "@obi-wallet/common";
import { useEffect } from "react";

import { useStore } from "../../src/app/stores";
import { useMultisigWallet } from "../../src/app/stores";
import { AccountsScreen } from "../../src/screens/accounts";
import { getGatekeeperConfigDraftId } from "../../src/screens/accounts/draft-id";

export default function AccountsScreenFixture() {
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

  return <AccountsScreen />;
}
