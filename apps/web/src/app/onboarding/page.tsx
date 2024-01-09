import { ButtonLink, Text } from "@/components";
import Image from "next/image";

export default function Introduction() {
  return (
    <section className="flex w-full flex-col items-center justify-center space-y-9">
      <Text className="text-2xl" leading="normal" fontWeight="bold">
        What is an Obi Account?
      </Text>
      <Image
        width="151"
        height="268"
        src="/assets/images/obi-wizard.png"
        alt="Icon"
      />
      <div className=" w-[440px] space-y-9">
        <Text
          className="text-center text-base "
          color="zinc"
          fontWeight="medium"
          leading="tight"
        >
          Obi Smart Accounts are a convenient and secure way to custody your
          crypto assets without the risk and hassle of seed phrases or private
          keys.
        </Text>
        <ButtonLink
          href="/onboarding/internal"
          className="block w-full"
          variant="primary"
        >
          Get Started
        </ButtonLink>
      </div>
    </section>
  );
}
