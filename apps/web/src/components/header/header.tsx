"use client";

import { Button } from "@/components";
import { PrimaryLink } from "@/components/links";
import { Text } from "@/components/text/text";
import { useStore } from "@/contexts";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

export const Header = observer(function Header() {
  const { walletsStore } = useStore();
  const router = useRouter();

  function renderChildren() {
    // TODO: styling, Button looks different than ButtonLink
    if (walletsStore.currentWallet) {
      return (
        <Button
          onClick={() => {
            walletsStore.logout();
          }}
        >
          Log out
        </Button>
      );
    }

    // TODO: This should lead to recovery flow instead or show a login modal
    return (
      <Button
        onClick={() => {
          const firstWallet = walletsStore.wallets[0];
          if (firstWallet) {
            walletsStore.setCurrentWallet(firstWallet);
          }
          router.push("/onboarding/internal");
        }}
      >
        Log in
      </Button>
    );
  }

  return (
    <header className="flex h-20 items-center justify-between bg-blue-600 px-8 shadow">
      <PrimaryLink href="/">
        <Text color="white" size="2xl" fontWeight="bold" className="leading-3">
          Obi
        </Text>
      </PrimaryLink>
      {renderChildren()}
    </header>
  );
});
