"use client";

import { LandingPageButton } from "@/components/buttons";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import Image from "next/image";

export default observer(function Introduction() {
  useCurrentWallet({ redirectTo: "/dashboard", redirectIfFound: true });

  return (
    //** Deprecated  Landing Page */
    // <section className="flex w-full flex-col items-center space-y-9 p-5 max-sm:px-10">
    //   <Image
    //     width="306"
    //     height="234"
    //     src="/assets/images/obi-wizard.png"
    //     alt="OBI Logo"
    //     className="mt-48"
    //   />
    //   <BitButton
    //     href="/onboarding/internal"
    //     className="font-press-start-2p before:contents: bg-transparent"
    //   >
    //     Press Start
    //   </BitButton>
    // </section>
    <section className="flex min-h-screen w-full flex-col gap-12 text-white lg:gap-24">
      <section className="px-6 text-center flex flex-col justify-center min-h-full lg:px-28 pb-48 lg:text-left">
        <h1 className="text-xl font-light lg:text-5xl lg:leading-tight">
          RECOVERABLE ACCOUNTS THAT <br /> MAKE NAVIGATING CRYPTO <br />{" "}
          <span className="font-bold">SIMPLE AND SECURE</span>
        </h1>
        <p className="mt-6 text-xs font-extralight lg:text-3xl">
          Press start to build your smart account now
        </p>
        <div className="mt-6 flex flex-col space-y-5 lg:mt-8 lg:w-auto lg:flex-row lg:space-x-4 lg:space-y-0">
          <LandingPageButton href="/onboarding/internal" colorScheme="dark">
            PRESS START
          </LandingPageButton>
          <LandingPageButton href="https://docs.obi.money" colorScheme="light">
            {" "}
            DOCUMENTS{" "}
          </LandingPageButton>
        </div>
      </section>
      <section className="px-6 text-center">
        <h2 className="mb-6 text-lg font-semibold lg:mb-8 lg:text-4xl">
          Are you frustrated with the current state of crypto wallets?
        </h2>
        <div className="gap-52 space-y-6 text-center text-white lg:flex lg:flex-row lg:justify-center lg:space-y-0">
          <div>
            {/* <svg className="mx-auto mb-4" width="101" height="100" viewBox="0 0 101 100" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"> */}
            <Image
              alt="landing-close"
              className="mx-auto mb-4"
              width="101"
              height="100"
              src="/assets/icons/landing-close.svg"
            />
            <p className="text-sm lg:text-2xl">
              Risky key set up <br /> and lost funds
            </p>
          </div>
          <div>
            <Image
              alt="landing-close"
              className="mx-auto mb-4"
              width="101"
              height="100"
              src="/assets/icons/landing-close.svg"
            />
            <p className="text-sm lg:text-2xl">
              Multiple interfaces <br /> to manage assets
            </p>
          </div>
          <div>
            <Image
              alt="landing-close"
              className="mx-auto mb-4"
              width="101"
              height="100"
              src="/assets/icons/landing-close.svg"
            />
            <p className="text-sm lg:text-2xl">
              Sketchy bridging <br /> across ecosystems
            </p>
          </div>
        </div>
      </section>
      <section className="lg:py-25 bg-sky-600 py-16 text-center">
        <h2 className="text-base lg:text-4xl">
          With Obi, you manage all of your assets in one place <br />
          secured by the keys of your choice
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
          Obi is built different.
        </h2>
        <div className="space-y-6 text-center text-white lg:flex lg:flex-row lg:justify-center lg:gap-48 lg:space-y-0 lg:text-2xl">
          <div>
            <Image
              alt="landing-access"
              className="mx-auto mb-4"
              width="65"
              height="64"
              src="/assets/icons/landing-access.svg"
            />
            <p>
              Custom key setup <br />
              for convenient transactions <br /> and recoverability
            </p>
          </div>
          <div>
            <Image
              alt="landing-home"
              className="mx-auto mb-4"
              width="65"
              height="64"
              src="/assets/icons/landing-home.svg"
            />
            <p>
              Multi-chain accounts for
              <br />
              EVM, L2s, Cosmos + <br /> Solana & Bitcoin (soon)
            </p>
          </div>
          <div>
            <Image
              alt="landing-champagne"
              className="mx-auto mb-4"
              width="65"
              height="64"
              src="/assets/icons/landing-champagne.svg"
            />
            <p>
              Party-up with other users <br />
              to manage treasuries and <br /> DAO assets
            </p>
          </div>
        </div>
      </section>
      <section className="lg:py-25 bg-sky-600 py-16 text-center">
        <h2 className="text-base font-semibold lg:text-4xl">
          Manage assets on all chains in one convenient dashboard
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
          Tired of crying about bad crypto UX? We were too...
        </h2>
        <p className="mb-8 text-sm lg:text-3xl">
          ...which is why we've built a new approach to managing assets for
          hundreds of users that delivers convenience without sacrificing
          security.
        </p>
        <p className="mb-8 text-sm lg:text-3xl">
          At Obi we believe self-custody is a human right. You shouldn't be
          plagued with the pitfalls of stolen assets or the headaches of
          navigating decentralized ecosystems with current crypto wallets.
        </p>

        <div className="my-16 items-center justify-items-center space-y-10 lg:flex lg:flex-row lg:justify-between lg:space-y-0">
          {/* Placeholder for partner logos */}
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
  );
});
