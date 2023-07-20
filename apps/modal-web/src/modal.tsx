/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use client";

import {
  obiModalConfig,
  osmosisModalConfig,
  vertexModalConfig,
  ztxModalConfig,
} from "@obi-wallet/config";
import * as M from "@obi-wallet/modal";

// eslint-disable-next-line mobx/missing-observer,import/no-default-export
export default function Modal(props: { config: string }) {
  const config = getConfig();

  return (
    <M.Container config={config}>
      <M.Provider
        env={{
          PHONE_NUMBER_KEY_SECRET:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_KEY_SECRET!,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_USER:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_USER!,
          PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD:
            process.env.NEXT_PUBLIC_PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD!,
        }}
        config={config}
      >
        <M.ModalWithoutProvider />
      </M.Provider>
    </M.Container>
  );

  function getConfig() {
    switch (props.config) {
      case "obi":
        return obiModalConfig;
      case "osmosis":
        return osmosisModalConfig;
      case "vertex":
        return vertexModalConfig;
      case "ztx":
        return ztxModalConfig;
      default:
        return obiModalConfig;
    }
  }
}
