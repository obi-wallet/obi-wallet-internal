"use client";
import Typography from "@/components/Typography";
import ButtonLink from "@/components/links/ButtonLink";
import Stepper from "@/components/Stepper";
import Image from "next/image";
export default function Step2() {
  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={2} />
      <Typography fontWeight="bold" size="3xl">
        Secure Your Account
      </Typography>
      <Typography
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Keys give access to your account. Like multi-factor authentication,
        creating multiple keys enhances the security of your account.
      </Typography>
      <Image
        width="262"
        height="262"
        src="/assets/images/Dall.png"
        alt="Icon"
      />
      <Typography
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Additional key types also serve as a safety measure to recover your
        assets in the circumstance that you lose access to one or more of your
        keys.
      </Typography>

      <ButtonLink
        href="/onboarding/step3"
        className="block w-full"
        variant="primary"
      >
        Create My First Key
      </ButtonLink>
    </section>
  );
}
