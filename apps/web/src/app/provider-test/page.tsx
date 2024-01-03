"use client";

import { PrimaryLink, Text } from "@/components";
import { Provider } from "@/components/provider";
import { useStore } from "@/contexts";

export default function Homepage() {
  return (
    <Provider>
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
