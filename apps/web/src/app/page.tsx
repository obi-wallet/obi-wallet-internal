"use client";

import { Header } from "@/components";
import { LandingPageButton } from "@/components/buttons";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { MainContainer } from "@/layouts/root";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export default observer(function Introduction() {
  useCurrentWallet({ redirectTo: "/dashboard", redirectIfFound: true });

  return (
    <>
      <Header />
      <MainContainer>
        <section className="flex min-h-screen w-full w-screen flex-col gap-12 bg-gray-900 text-white lg:gap-24">
          <section className="flex h-full min-h-screen w-full w-screen min-w-full flex-col justify-center px-6 pb-48 text-center lg:px-28 lg:text-left">
            <h1 className="text-xl font-light lg:text-5xl lg:leading-tight">
              SIMPLE, SECURE, AND <br /> RECOVERABLE ACCOUNTS FOR <br />{" "}
              <span className="font-bold">EFFORTLESS CRYPTO MANAGEMENT</span>
            </h1>
            <p className="mt-6 text-xs font-extralight lg:text-3xl">
              Get started with your secure smart account
            </p>
            <div className="mt-6 flex flex-col space-y-5 lg:mt-8 lg:w-auto lg:flex-row lg:space-x-4 lg:space-y-0">
              <LandingPageButton href="/onboarding/internal" colorScheme="dark">
                START NOW
              </LandingPageButton>
              <LandingPageButton
                href="https://docs.obi.money"
                colorScheme="light"
              >
                BUILD WITH OBI
              </LandingPageButton>
            </div>

            {/* Scroll Down Arrows */}
            <div className="absolute inset-x-0 bottom-[10%] flex justify-center">
              <button
                onClick={() => {
                  document
                    .getElementById("next-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                aria-label="Scroll down"
                className="focus:outline-none"
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg
                    className="h-9 w-9 animate-bounce text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <svg
                    className="h-9 w-9 animate-bounce text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
            </div>
            {/* End of Scroll Down Arrows */}
          </section>
          <section id="next-section" className="px-6 pt-12 text-center">
            <h2 className="mb-6 text-lg font-semibold lg:mb-8 lg:text-4xl">
              Frustrated with crypto wallets that complicate security and
              usability?
            </h2>
            <div className="space-y-6 text-center text-white lg:flex lg:flex-row lg:justify-between lg:space-y-0 lg:text-2xl">
              <div className="w-full px-4 lg:w-1/3">
                <Image
                  alt="landing-close"
                  className="mx-auto mb-4"
                  width="101"
                  height="100"
                  src="/assets/icons/landing-close.svg"
                />
                <p className="text-sm lg:text-2xl">
                  Risky key setups <br /> and lost funds
                </p>
              </div>
              <div className="w-full px-4 lg:w-1/3">
                <Image
                  alt="landing-close"
                  className="mx-auto mb-4"
                  width="101"
                  height="100"
                  src="/assets/icons/landing-close.svg"
                />
                <p className="text-sm lg:text-2xl">
                  Constant switching between interfaces <br /> to track assets
                </p>
              </div>
              <div className="w-full px-4 lg:w-1/3">
                <Image
                  alt="landing-close"
                  className="mx-auto mb-4"
                  width="101"
                  height="100"
                  src="/assets/icons/landing-close.svg"
                />
                <p className="text-sm lg:text-2xl">
                  Unreliable bridging <br /> across chains and ecosystems
                </p>
              </div>
            </div>
          </section>
          <section className="lg:py-25 bg-sky-600 py-16 text-center">
            <h2 className="text-base lg:text-4xl">
              With Obi, manage all of your assets securely with a simple, <br />
              custom multi-factor setup that puts you in control
            </h2>
            <LandingPageButton
              href="/onboarding/internal"
              className="mt-12 bg-white"
              colorScheme="light"
            >
              START NOW
            </LandingPageButton>
          </section>
          <section className="px-6 text-center">
            <h2 className="mb-6 text-2xl font-semibold lg:mb-8 lg:text-4xl">
              Obi is Built Different
            </h2>
            <div className="space-y-6 text-center text-white lg:flex lg:flex-row lg:justify-between lg:space-y-0 lg:text-2xl">
              <div className="w-full px-4 lg:w-1/3">
                <Image
                  alt="landing-access"
                  className="mx-auto mb-4"
                  width="65"
                  height="64"
                  src="/assets/icons/landing-access.svg"
                />
                <p>
                  <em>Customizable key setup</em> <br />
                  for smooth transactions <br /> and easy recovery
                </p>
              </div>
              <div className="w-full px-4 lg:w-1/3">
                <Image
                  alt="landing-home"
                  className="mx-auto mb-4"
                  width="65"
                  height="64"
                  src="/assets/icons/landing-home.svg"
                />
                <p>
                  <em>Multi-chain compatibility</em>
                  <br />
                  EVM, L2s, Cosmos, Solana <br /> + Bitcoin coming soon
                </p>
              </div>
              <div className="w-full px-4 lg:w-1/3">
                <Image
                  alt="landing-champagne"
                  className="mx-auto mb-4"
                  width="65"
                  height="64"
                  src="/assets/icons/landing-champagne.svg"
                />
                <p>
                  <em>Collaborative asset management</em> <br />
                  Team up for treasuries <br /> and DAOs
                </p>
              </div>
            </div>
          </section>
          <section className="lg:py-25 bg-sky-600 py-16 text-center">
            <h2 className="text-base font-semibold lg:text-4xl">
              One dashboard to manage assets across all chains and networks
            </h2>
            <LandingPageButton
              href="/onboarding/internal"
              className="mt-12 bg-white"
              colorScheme="light"
            >
              START NOW
            </LandingPageButton>
          </section>
          <section className="px-20 py-8 lg:py-12">
            <h2 className="mb-6 text-2xl lg:mb-16 lg:text-5xl">
              Frustrated with clunky crypto UX? So are we.
            </h2>
            <p className="mb-8 text-sm lg:text-3xl">
              Obi was built to give you a seamless, secure way to manage assets
              conveniently and without compromise.
            </p>
            <p className="mb-8 text-sm lg:text-3xl">
              Self-custody is a human right. With Obi, avoid the common pitfalls
              of lost assets and navigate decentralized ecosystems effortlessly
              – while staying fully in control.
            </p>

            <div className="my-16 items-center justify-items-center space-y-10 lg:flex lg:flex-row lg:justify-between lg:space-y-0">
              <p className="text-sm">Supported By</p>
              <Image
                alt="landing-artboard-12"
                width="124"
                height="44"
                src="/assets/icons/landing-artboard-12.svg"
              />
              <Image
                alt="landing-asset-21"
                width="112"
                height="44"
                src="/assets/icons/landing-asset-21.svg"
              />
              <Image
                alt="landing-asset-22"
                width="142"
                height="40"
                src="/assets/icons/landing-asset-22.svg"
              />
              <Image
                alt="landing-wagmi"
                width="80"
                height="80"
                src="/assets/icons/landing-wagmi.svg"
              />
              <Image
                alt="landing-shade"
                width="140"
                height="36"
                src="/assets/icons/landing-shade.svg"
              />
              <Image
                alt="landing-asset-13"
                width="144"
                height="48"
                src="/assets/icons/landing-asset-13.svg"
              />
            </div>
          </section>
        </section>
      </MainContainer>
    </>
  );
});
