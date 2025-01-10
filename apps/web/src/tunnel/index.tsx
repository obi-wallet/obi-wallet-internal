"use client";

import { Text } from "@/components";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const TunnelEmbed = observer(function TunnelEmbed() {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep((prevStep) => {
      return Math.min(prevStep + 1, 3);
    });
  };

  //   const prevStep = () => {
  //     setStep((prevStep) => {
  //       return Math.max(prevStep - 1, 1);
  //     });
  //   };

  //   const handleAction = async () => {
  //     console.log(await getPasskey());
  //   };

  //   const handleSubmit = async () => {
  //     console.log("Submitting...", window.opener, window.parent);
  //     if (window.opener) {
  //       window.opener.postMessage({ type: "TUNNEL_COMPLETE" }, "*");
  //     }
  //     if (window.parent) {
  //       window.parent.postMessage({ type: "TUNNEL_COMPLETE" }, "*");
  //     }
  //   };

  if (step === 1) {
    return <ChooseAsset onDone={nextStep} />;
  }
  if (step === 2) {
    return <ChooseAddress onDone={nextStep} />;
  }
  if (step === 3) {
    return <Deposit />;
  }
});

const ChooseAsset = observer<{ onDone: () => void }>(function ChooseAsset({
  onDone,
}) {
  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        Deposit your asset here to receive $XYZ
      </Text>

      <div className="mt-6 flex flex-col">
        <label htmlFor="assetAmount" className="mb-2">
          <Text size="sm" className="text-gray-200">
            How much are you depositing?
          </Text>
        </label>
        <Input
          id="assetAmount"
          labelClassname="bg-background-secondary"
          className="h-[48px] w-full rounded-[5px] border border-[#32c9af]"
          placeholder="0.5"
          // Future: replace rightComponent with a dropdown if needed
          rightComponent={
            <div className="flex w-full justify-end">
              <Text>ETH</Text>
            </div>
          }
          // onChange / value can be hooked up later
        />
      </div>

      <div className="mt-6 flex flex-col">
        <label htmlFor="expectedReceive" className="mb-2">
          <Text size="sm" className="text-gray-200">
            You are expected to receive:
          </Text>
        </label>
        <Input
          id="expectedReceive"
          labelClassname="bg-background-secondary"
          className="h-[48px] w-full rounded-[5px] border border-[#32c9af]"
          placeholder="0.5"
          // onChange / value can be hooked up later
        />
      </div>

      <AsyncButton
        className="mt-8 w-full"
        variant="secondary"
        onClick={async () => {
          onDone();
        }}
      >
        Continue
      </AsyncButton>
    </div>
  );
});

const ChooseAddress = observer<{ onDone: () => void }>(function ChooseAddress({
  onDone,
}) {
  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        {/* TODO: get asset name & amount */}
        Receive XXX $XYZ
      </Text>
      <Text className="mt-4">
        {/* TODO: label instead */}
        <span className="align-middle leading-normal">
          Connect your wallet:
        </span>
      </Text>
      <AsyncButton
        className="mt-2 w-full"
        variant="primary"
        // TODO: handle disabled state
        onClick={async () => {
          console.log("continue");
        }}
      >
        Connect Phantom
      </AsyncButton>
      <AsyncButton
        className="mt-2 w-full"
        variant="primary"
        // TODO: handle disabled state
        onClick={async () => {
          console.log("continue");
        }}
      >
        Connect Obi
      </AsyncButton>
      <Text className="mt-4">
        {/* TODO: label instead */}
        <span className="align-middle leading-normal">
          Or paste an address:
        </span>
      </Text>
      <Input
        labelClassname="bg-background-secondary"
        className="mt-2 h-[48px] w-full rounded-[5px] border border-[#32c9af]"
        placeholder="Paste your address here"
        // value={field.value}
        // onChange={(recipient) => {
        //   field.onChange(recipient);
        // }}
      />
      <AsyncButton
        className="mt-2 w-full"
        variant="secondary"
        // TODO: handle disabled state
        onClick={async () => {
          onDone();
        }}
      >
        Continue
      </AsyncButton>
    </div>
  );
});

const Deposit = observer(function Deposit() {
  return (
    <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
      <Text size="xl" className="flex items-center gap-2">
        {/* TODO: get asset name & amount */}
        You are expected to receive XXX $XYZ
      </Text>
      <Text className="mt-4">
        {/* TODO: label instead */}
        <span className="align-middle leading-normal">Receiving address:</span>
      </Text>
      <AsyncButton
        className="mt-2 w-full"
        variant="primary"
        // TODO: handle disabled state
        onClick={async () => {
          console.log("continue");
        }}
      >
        XXXX
      </AsyncButton>
      <Text className="mt-4">
        {/* TODO: label instead */}
        <span className="align-middle leading-normal">
          Please send YYY $YXZ to the address below to complete the transaction:
        </span>
      </Text>
      <Input
        labelClassname="bg-background-secondary"
        className="mt-2 h-[48px] w-full rounded-[5px] border border-[#32c9af]"
        // TODO: handle value, copy-paste
        value="0x1234567890"
        // value={field.value}
        // onChange={(recipient) => {
        //   field.onChange(recipient);
        // }}
      />
      <AsyncButton
        className="mt-2 w-full"
        variant="outline"
        // TODO: handle disabled state
        onClick={async () => {
          console.log("continue");
        }}
      >
        Awaiting Deposit
      </AsyncButton>
    </div>
  );
});
