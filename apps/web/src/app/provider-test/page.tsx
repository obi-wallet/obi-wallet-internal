"use client";

import { PrimaryLink, Text } from "@/components";
import { Provider } from "@/components/provider";
import { useStore } from "@/contexts";
import { obiModalConfig } from "@obi-wallet/config";

export default function Homepage() {
  return (
    <Provider
      // TODO: Add env variables
      env={{
        PHONE_NUMBER_KEY_SECRET: "TODO",
        PHONE_NUMBER_TWILIO_BASIC_AUTH_USER: "TODO",
        PHONE_NUMBER_TWILIO_BASIC_AUTH_PASSWORD: "TODO",
      }}
      config={obiModalConfig}
    >
      <section className="flex w-full flex-col items-center justify-center space-y-9">
        <PrimaryLink href="/onboarding/introduction">
          <Text size="3xl" fontWeight="bold">
            Welcome to OBI
          </Text>
        </PrimaryLink>
        <StoreTest />
      </section>
    </Provider>
  );
}

function StoreTest() {
  const store = useStore();
  console.log(store.configStore.config.languages.default);
  return null;
}
