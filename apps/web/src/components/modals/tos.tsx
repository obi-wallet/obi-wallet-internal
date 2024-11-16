"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";

import { Modal } from ".";
import { Button } from "..";

export function TOSModal() {
  const [showTOSModal, setShowTOSModal] = useState(false);
  const [firstCheckbox, setFirstCheckbox] = useState(false);

  // Check localStorage for tosAccepted on component mount
  useEffect(() => {
    const tosAccepted = localStorage.getItem("tosAccepted");
    setShowTOSModal(!tosAccepted);
  }, []);

  const acceptTOS = () => {
    localStorage.setItem("tosAccepted", "true");
    setShowTOSModal(false);
  };

  if (!showTOSModal) return null;

  return (
    <Modal title="">
      <div className="flex flex-col gap-6 p-6 bg-background text-white font-roboto-mono">
        {/* Disclaimer Heading */}
        <h2 className="text-xl font-normal">Disclaimer</h2>

        {/* Agreement Prompt */}
        <p className="text-xl font-normal">
          Please check the box below to confirm your agreement to the{" "}
          <Link
            href="https://docs.google.com/document/d/1mqCHAYghjEQJQaW5lnTY6w9690Znr6qQlOH34KEEzkE/edit?usp=sharing"
            className="text-primary underline"
            target="_blank"
          >
            Obi Terms and Conditions
          </Link>
        </p>

        {/* Description */}
        <div className="text-sm font-normal space-y-4">
          <p>
            While Obi’s smart contracts have been audited by third parties, the use of Obi Fast
            Travel and Obi Dashboard is noncustodial and there are no representations or warranties
            that its usage will be uninterrupted or error-free. Services are provided on an “as is”
            and “as available” basis. Any risk of usage of Obi services is solely borne by User.
          </p>
          <p>
            Obi reserves the right to make changes to Obi Fast Travel and Obi Dashboard in its sole
            discretion as it deems necessary or desirable. User’s continued use of Obi Fast Travel
            and Obi Dashboard constitutes acceptance of any changes made.
          </p>
        </div>

        {/* Checkbox and Agreement Text */}
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="tosCheckbox"
            checked={firstCheckbox}
            onChange={() => setFirstCheckbox(!firstCheckbox)}
            className="hidden"
          />
          <label
            htmlFor="tosCheckbox"
            className="flex items-center gap-4 cursor-pointer"
          >
            <div
              className={cn(
                "flex items-center justify-center w-[22px] h-[22px] rounded border flex-shrink-0",
                firstCheckbox
                  ? "bg-primary border-primary"
                  : "bg-[#d9d9d9] border-gray-400"
              )}
            >
              {firstCheckbox ? (
                <FaCheck className="text-background" />
              ) : (
                <span className="invisible">
                  <FaCheck />
                </span>
              )}
            </div>
            <p className="text-xl font-normal">
              I understand the risks of self custody and agree to{" "}
              <Link
                href="https://docs.google.com/document/d/1mqCHAYghjEQJQaW5lnTY6w9690Znr6qQlOH34KEEzkE/edit?usp=sharing"
                className="text-primary underline"
                target="_blank"
              >
                Obi Terms and Conditions
              </Link>
            </p>
          </label>
        </div>

        {/* Confirm Button */}
        <div className="mt-4 text-center">
          <button
            onClick={acceptTOS}
            disabled={!firstCheckbox}
            className={cn(
              "w-full py-2.5 rounded-[5px] text-xl font-normal text-center bg-primary text-[#070707]",
              !firstCheckbox && "opacity-50 cursor-not-allowed"
            )}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}
