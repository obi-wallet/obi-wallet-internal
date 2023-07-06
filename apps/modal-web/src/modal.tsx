/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import * as M from "@obi-wallet/modal";
import {
  obiTheme,
  osmosisTheme,
  vertexTheme,
  ztxTheme,
} from "@obi-wallet/theme";

// eslint-disable-next-line mobx/missing-observer,import/no-default-export
export default function Modal(props: { theme: string }) {
  const theme = getTheme();

  return (
    <M.Container theme={theme}>
      <M.Provider
        env={{
          PHONE_NUMBER_KEY_SECRET:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_KEY_SECRET!,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_USER:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_USER!,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD!,
        }}
        theme={theme}
      >
        <M.ModalWithoutProvider />
      </M.Provider>
    </M.Container>
  );

  function getTheme() {
    switch (props.theme) {
      case "obi":
        return obiTheme;
      case "osmosis":
        return osmosisTheme;
      case "vertex":
        return vertexTheme;
      case "ztx":
        return ztxTheme;
      default:
        return obiTheme;
    }
  }
}
