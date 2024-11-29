"use client";

import { getPasskey } from "@obi-wallet/sdk";
import { useState } from "react";

export default function ThreeStepDialog() {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep((prevStep) => {
      return Math.min(prevStep + 1, 3);
    });
  };

  const prevStep = () => {
    setStep((prevStep) => {
      return Math.max(prevStep - 1, 1);
    });
  };

  const handleAction = async () => {
    console.log(await getPasskey());
  };

  const handleSubmit = async () => {
    console.log("Submitting...");
  };

  return (
    <div className="bg-background-main flex min-h-screen flex-col items-center justify-center p-8 text-white">
      <div className="bg-background-secondary w-full max-w-md rounded-lg p-8 shadow-lg">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Three Step Dialog
        </h1>

        <div className="mb-8 text-center">
          {step === 1 && (
            <div>
              <p className="mb-4 text-xl">Step 1: Introduction</p>
              <button
                onClick={handleAction}
                className="bg-background-primary hover:bg-background-primary-hover rounded-md px-6 py-2 transition-colors"
              >
                Do Something
              </button>
            </div>
          )}
          {step === 2 && <p className="text-xl">Step 2: Details</p>}
          {step === 3 && (
            <div>
              <p className="mb-4 text-xl">Step 3: Confirmation</p>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="bg-background-select hover:bg-background-select-hover rounded-md px-6 py-2 transition-colors"
            >
              Previous
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={nextStep}
              className="bg-background-primary hover:bg-background-primary-hover ml-auto rounded-md px-6 py-2 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-background-primary hover:bg-background-primary-hover ml-auto rounded-md px-6 py-2 transition-colors"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
