import { Modal, renderModal } from "@/components";
import copy from "copy-to-clipboard";
import { useState } from "react";

export function TerraStationModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <a
        className="text-primary mt-2 underline hover:cursor-pointer"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Having trouble with Terra Station?
      </a>

      {isModalOpen
        ? renderModal(
            <Modal
              title=""
              boxClassname="h-fit w-[560px] !min-w-[320px] px-4 py-6 max-md:w-[90%] max-sm:w-[400px]"
              onClose={() => {
                setIsModalOpen(false);
              }}
            >
              <div className="bg-background flex flex-col gap-6 p-6 text-white">
                <h2 className="text-xl font-normal">
                  Changing Endpoints in Terra Station
                </h2>

                <img
                  src="/assets/images/0253820d6d20cd40a0553cc31d654b94.jpeg"
                  alt="Terra Station: Add LCD Endpoint"
                />

                <div className="space-y-4 text-sm font-normal">
                  <p>
                    If balances in your Station wallet aren't loading or
                    transactions are failing, connect to a different endpoint in
                    the Station extension.
                  </p>

                  <ol className="list-inside list-decimal">
                    <li>
                      In the Station wallet, go to Settings › Network and click
                      Add Custom LCD Endpoint.
                    </li>
                    <li>
                      Choose Terra and paste your LCD address in the Custom URL
                      box. Use{" "}
                      <a
                        className="text-primary underline hover:cursor-pointer"
                        onClick={() => {
                          copy("https://terra-api.cosmosrescue.dev:8443");
                        }}
                      >
                        https://terra-api.cosmosrescue.dev:8443
                      </a>{" "}
                      or another Terra REST endpoint from{" "}
                      <a
                        href="https://cosmos.directory/terra2/nodes"
                        className="text-primary underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://cosmos.directory/terra2/nodes
                      </a>
                      .
                    </li>
                    <li>
                      Once you see a green Valid message, save your new
                      settings.
                    </li>
                  </ol>
                  <p>
                    Note: This does not function on the Station web dashboard.
                    You must use the mobile app or browser extension.
                  </p>
                </div>
              </div>
            </Modal>,
          )
        : null}
    </>
  );
}
