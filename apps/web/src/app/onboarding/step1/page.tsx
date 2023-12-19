"use client";
import Typography from "@/components/Typography";
import Input from "@/components/Input";
import Dropzone from "@/components/Dropzone";
import ButtonLink from "@/components/links/ButtonLink";
import Stepper from "@/components/Stepper";
export default function Step1() {
  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper />
      <Typography fontWeight="bold" size="3xl">
        Name Your Account
      </Typography>
      <Typography
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Start by naming your account and uploading a profile picture associated
        with it.
      </Typography>
      <Input
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          console.log(e.target.value);
        }}
        placeholder="Name"
      />
      <Dropzone className="mt-8" />
      <ButtonLink
        href="/onboarding/step2"
        className="block w-full"
        variant="primary"
      >
        Continue
      </ButtonLink>
    </section>
  );
}
