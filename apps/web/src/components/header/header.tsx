import { PrimaryLink, ButtonLink } from "../links";
import { Text } from "../text/text";

export function Header() {
  return (
    <header className="flex h-20 items-center justify-between bg-blue-600 px-8 shadow">
      <PrimaryLink href="/">
        <Text color="white" size="2xl" fontWeight="bold" className="leading-3">
          Obi
        </Text>
      </PrimaryLink>
      <ButtonLink href="/dashboard">Log in</ButtonLink>
    </header>
  );
}
