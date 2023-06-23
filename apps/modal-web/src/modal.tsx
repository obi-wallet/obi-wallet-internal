/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import * as M from "@obi-wallet/modal";
import { obiTheme } from "@obi-wallet/theme";

// eslint-disable-next-line mobx/missing-observer,import/no-default-export
export default function Modal() {
  return (
    <M.Container theme={obiTheme}>
      <M.Provider
        env={{
          PHONE_NUMBER_KEY_SECRET:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_KEY_SECRET!,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_USER:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_USER!,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD!,
        }}
        theme={obiTheme}
      >
        <M.ModalWithoutProvider />
      </M.Provider>
    </M.Container>
  );
}
