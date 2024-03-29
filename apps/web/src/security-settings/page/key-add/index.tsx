import { KeyAddPage } from "@/security-settings/context";
import { AddPasskeyPage } from "@/security-settings/page/key-add/passkey";
import { AddPhoneKeyPage } from "@/security-settings/page/key-add/phone";
import { KeyType } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

export const SecuritySettingsKeyAddPage = observer<{ page: KeyAddPage }>(
  function SecuritySettingsKeyAddPage({ page }) {
    switch (page.payload) {
      case KeyType.Passkey:
        return <AddPasskeyPage />;
      case KeyType.Phone:
        return <AddPhoneKeyPage />;
      default:
        console.error("Not implemented");
    }
  },
);
