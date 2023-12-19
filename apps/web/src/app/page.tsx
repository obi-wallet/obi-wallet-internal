import ButtonLink from "@/components/links/ButtonLink";
import Typography from "@/components/Typography";
import Image from "next/image";

// import wizardImage from "~/assets/images/Obi Wizard.png";
export default function Homepage() {
  return (
    <section className="flex flex-col items-center justify-center space-y-9">
      <Typography className="text-2xl" leading="normal" fontWeight="bold">
        What is an Obi Account?
      </Typography>
      <Image
        width="151"
        height="268"
        src="/assets/images/Obi Wizard.png"
        alt="Icon"
      />
      <div className=" w-[440px] space-y-9">
        <Typography
          className="text-center text-base "
          color="zinc"
          fontWeight="medium"
          leading="tight"
        >
          Obi Smart Accounts are a convenient and secure way to custody your
          crypto assets without the risk and hassle of seed phrases or private
          keys.
        </Typography>
        <ButtonLink
          href="/onboarding/step1"
          className="block w-full"
          variant="primary"
          isDarkBg
        >
          Get Started
        </ButtonLink>
      </div>
    </section>
  );
}
