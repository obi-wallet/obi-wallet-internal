"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";

import { Modal } from ".";
import { Button } from "..";

export function TOSModal() {
  // check localstorage for tos accepted
  const tosAccepted = localStorage.getItem("tosAccepted");
  const [showTOSModal, setShowTOSModal] = useState(!tosAccepted);
  const [firstCheckbox, setFirstCheckbox] = useState(false);
  const [secondCheckbox, setSecondCheckbox] = useState(false);
  const acceptTOS = () => {
    localStorage.setItem("tosAccepted", "true");
    setShowTOSModal(false);
  };
  if (!showTOSModal) return null;

  return (
    <Modal title="Disclaimer">
      <div className="text-md ml-3 mr-3 text-white">
        <p className="mb-10 mt-5">
          Please check the boxes below to confirm your agreement to the{" "}
          <Link href="" className=" text-blue-600">
            Obi Terms and Conditions
          </Link>
        </p>
        <ul className="mb-5 mt-5 flex flex-col gap-5">
          <li
            className="flex flex-row"
            onClick={() => setFirstCheckbox(!firstCheckbox)}
          >
            <div>
              <div
                className={cn(
                  " m-6 mt-0 flex h-6 w-6 items-center justify-center rounded-md",
                  firstCheckbox ? "bg-green-600 " : "bg-white",
                )}
              >
                {firstCheckbox && <FaCheck className="text-sm" />}
              </div>
            </div>
            <div className=" text-sm">
              I have read and understood, and do hereby agree to be legally
              bound as a ‘User’ under, the Terms, including all future
              amendments thereto. Such agreement is irrevocable and will apply
              to all of my uses of the Site without me providing confirmation in
              each specific instance.
            </div>
          </li>
          <li
            className="flex flex-row"
            onClick={() => setSecondCheckbox(!secondCheckbox)}
          >
            <div>
              <div
                className={cn(
                  " m-6 mt-0 flex h-6 w-6 items-center justify-center rounded-md",
                  secondCheckbox ? "bg-green-600 " : "bg-white",
                )}
              >
                {secondCheckbox && <FaCheck className="text-sm" />}
              </div>
            </div>
            <div className=" text-sm">
              I acknowledge and agree that the Site solely provides information
              about data on the applicable blockchains. I accept that the Site
              operators have no custody over my funds, ability or duty to
              transact on my behalf or power to reverse my transactions. The
              Site operators do not endorse or provide any warranty with respect
              to any tokens.
            </div>
          </li>
        </ul>
        <div className=" mt-8 flex justify-center">
          <Button
            onClick={acceptTOS}
            variant="primary"
            disabled={!firstCheckbox || !secondCheckbox}
            className=" w-32 items-center justify-center"
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
