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
          <Link
            href="https://docs.google.com/document/d/1mqCHAYghjEQJQaW5lnTY6w9690Znr6qQlOH34KEEzkE/edit?usp=sharing"
            className=" text-blue-600"
          >
            Obi Terms and Conditions
          </Link>
        </p>
        <ul className="mb-5 mt-5 flex cursor-pointer flex-col gap-5">
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
            <div className="flex flex-col gap-6 text-sm">
              <div>
                While Obi’s smart contracts have been audited by third parties,
                the use of Obi Fast Travel and Obi Dashboard is noncustodial and
                there are no representations or warranties that its usage will
                be uninterrupted or error-free. Services are provided on an “as
                is” and “as available” basis. Any risk of usage of Obi services
                is solely borne by User.
              </div>
              <div>
                User is responsible for the security of your blockchain
                account(s), including protecting your login credentials and
                private keys. <br />
              </div>
              <div>Obi is not responsible for any losses or damages.</div>
            </div>
          </li>
        </ul>
        <div className=" mt-8 flex justify-center">
          <Button
            onClick={acceptTOS}
            variant="primary"
            disabled={!firstCheckbox}
            className=" w-32 items-center justify-center"
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
