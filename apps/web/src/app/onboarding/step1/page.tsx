"use client";
import { Button, Dropzone, Input, Stepper, Text } from "@/components";
import { useStore } from "@/contexts";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import invariant from "tiny-invariant";

const Step1 = observer(function Step1() {
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();
  const { userDataStore } = useStore();

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={1} totalSteps={5} />
      <Text fontWeight="bold" size="3xl">
        Name Your Account
      </Text>
      <Text
        className="w-96 text-center"
        fontWeight="medium"
        leading="tight"
        color="zinc"
      >
        Start by naming your account and uploading a profile picture associated
        with it.
      </Text>
      <Input
        className="w-96"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setName(e.target.value);
        }}
        value={name}
        placeholder="Name"
      />

      <Dropzone
        className="mt-8"
        placeholder="Upload Picture"
        onChange={(files) => {
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            invariant(
              typeof reader.result === "string",
              "Expected reader result to be base64 string",
            );
            setImage(reader.result);
          });

          const file = files[0];
          if (file) {
            reader.readAsDataURL(file);
          }
        }}
      />

      {image && <img src={image} className="w-96 rounded-full" />}

      <Button
        onClick={() => {
          const userData = {
            userName: name,
            userAvatar: image,
          };
          userDataStore.setUserData(userData);
          // go to next step
          router.push("/onboarding/step2");
        }}
        className="block w-full"
        variant="primary"
        disabled={!name || !image}
      >
        Continue
      </Button>
    </section>
  );
});
export default Step1;
