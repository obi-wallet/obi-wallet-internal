"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";

import { Modal, renderModal } from ".";

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

  return renderModal(
    <Modal
      title=""
      boxClassname="h-fit w-[560px] !min-w-[320px] px-4 py-6 max-md:w-[90%] max-sm:w-[400px]"
    >
      <div className="bg-background flex flex-col gap-6 p-6 text-white">
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
        <div className="space-y-4 text-sm font-normal">
          <p>
            While Obi's smart contracts have been audited by third parties, the
            use of Obi Fast Travel and Obi Dashboard is noncustodial and there
            are no representations or warranties that its usage will be
            uninterrupted or error-free. Services are provided on an "as is" and
            "as available" basis. Any risk of usage of Obi services is solely
            borne by User.
          </p>
          <p>
            Obi reserves the right to make changes to Obi Fast Travel and Obi
            Dashboard in its sole discretion as it deems necessary or desirable.
            User's continued use of Obi Fast Travel and Obi Dashboard
            constitutes acceptance of any changes made.
          </p>
        </div>

        {/* Checkbox and Agreement Text */}
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="tosCheckbox"
            checked={firstCheckbox}
            onChange={() => {
              return setFirstCheckbox(!firstCheckbox);
            }}
            className="hidden"
          />
          <label
            htmlFor="tosCheckbox"
            className="flex cursor-pointer items-center gap-4"
          >
            <div
              className={cn(
                "flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded border",
                firstCheckbox
                  ? "bg-primary border-primary"
                  : "border-gray-400 bg-[#d9d9d9]",
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
              "bg-primary w-full rounded-[5px] py-2.5 text-center text-xl font-normal text-[#070707]",
              !firstCheckbox && "cursor-not-allowed opacity-50",
            )}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>,
  );
}
