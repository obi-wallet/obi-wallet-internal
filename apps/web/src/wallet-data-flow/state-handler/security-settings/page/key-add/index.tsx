import { KeyType } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

import { AddAuthenticatorKeyPage } from "./authenticator";
import { AddPasskeyPage } from "./passkey";
import { AddPhoneKeyPage } from "./phone";
import { AddTelegramKeyPage } from "./telegram";
import { KeyAddPage } from "../../context";

export const SecuritySettingsKeyAddPage = observer<{ page: KeyAddPage }>(
  function SecuritySettingsKeyAddPage({ page }) {
    switch (page.payload) {
      case KeyType.Passkey:
        return <AddPasskeyPage />;
      case KeyType.Phone:
        return <AddPhoneKeyPage />;
      case KeyType.Telegram:
        return <AddTelegramKeyPage />;
      case KeyType.Authenticator:
        return <AddAuthenticatorKeyPage />;
      default:
        console.error("Not implemented");
    }
  },
);
