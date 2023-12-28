import { PrimaryLink, Text, Switcher } from "@/components";

export default function Homepage() {
  return (
    <section className="flex w-full flex-col items-center justify-center space-y-9">
      <PrimaryLink href="/onboarding/introduction">
        <Text size="3xl" fontWeight="bold">
          Welcome to OBI
        </Text>
      </PrimaryLink>
      <div className="flex space-x-2">
        <Text>Toggle:</Text>
        <Switcher switched />
      </div>
    </section>
  );
}
