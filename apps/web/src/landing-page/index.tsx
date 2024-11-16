import { Header } from "@/components";
import { MainContainer } from "@/layouts/root";
import Image from "next/image";
import Link from "next/link";

export function LandingPage() {
  return (
    <>
      <Header />
      <MainContainer>
        <section className="bg-primary flex w-full flex-col gap-24 text-white">
          {/* Headline Section */}
          <section className="bg-background relative flex min-h-screen flex-col justify-center gap-8 px-6 py-20 text-center text-white lg:flex-row lg:items-center lg:px-28 lg:text-left">
            {/* Hero Section Content */}
            <div className="lg:w-2/3">
              <h1 className="text-4xl font-normal uppercase lg:text-5xl">
                SIMPLE AND SECURE ACCOUNTS FOR <br />
                <span className="font-bold">Effortless Crypto Management</span>
              </h1>
              <p className="mt-6 text-xl font-light">
                Get started with your secure smart account now
              </p>
              <div className="mt-6 flex flex-col gap-5 lg:flex-row">
                <Link
                  href="/onboarding/internal"
                  className="bg-primary flex items-center justify-center rounded px-10 py-5 text-xl font-normal text-[#070707] shadow"
                >
                  START NOW
                </Link>
                <Link
                  href="https://docs.obi.money"
                  className="text-accent flex items-center justify-center rounded bg-white px-10 py-5 text-xl font-normal"
                >
                  BUILD WITH OBI
                </Link>
              </div>
            </div>
            {/* Image */}
            <div className="bg-primary lg:w-1/3" />
            {/* Bouncing Arrow */}
            <div className="bg-primary absolute bottom-[10%] left-1/2 -translate-x-1/2 transform">
              <Link href="#next-section" aria-label="Scroll down">
                <svg
                  className="h-8 w-8 animate-bounce text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5v14M5 12l7 7 7-7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </section>

          {/* Stakes Section */}
          <section
            id="next-section"
            className="mx-auto flex max-w-screen-xl flex-col items-center gap-10 px-6 py-12"
          >
            <h2 className="text-center text-3xl font-bold text-white">
              Crypto wallets are insecure and difficult to use
            </h2>
            <div className="xxl:space-x-48 flex flex-col space-x-0 space-y-10 lg:flex-row lg:space-x-32 lg:space-y-0">
              <div className="flex flex-col items-center gap-5">
                <Image
                  src="/assets/images/shield-cross.svg"
                  alt="Risky Key Setups Icon"
                  width={100}
                  height={100}
                />
                <p className="text-center text-xl text-white">
                  Risky key setups <br /> and lost funds
                </p>
              </div>
              <div className="flex flex-col items-center gap-5">
                <Image
                  src="/assets/images/widget.svg"
                  alt="Switching Interfaces Icon"
                  width={100}
                  height={100}
                />
                <p className="text-center text-xl text-white">
                  Switching between <br /> interfaces
                </p>
              </div>
              <div className="flex flex-col items-center gap-5">
                <Image
                  src="/assets/images/danger.svg"
                  alt="Accidental Errors Icon"
                  width={100}
                  height={100}
                />
                <p className="text-center text-xl text-white">
                  Accidental errors <br /> and misclicks
                </p>
              </div>
            </div>
          </section>

          {/* Solution Section */}
          <section className="flex flex-col items-center gap-8 px-6 py-12">
            <h2 className="text-center text-3xl font-bold text-white">
              Obi gives you an effortless crypto experience
            </h2>
            <div className="xxl:space-x-48 flex flex-col space-x-0 space-y-10 lg:flex-row lg:space-x-32 lg:space-y-0">
              <div className="flex flex-col items-center gap-5">
                <Image
                  src="/assets/images/key.svg"
                  alt="No Seed Phrases Icon"
                  width={100}
                  height={100}
                />
                <p className="text-center text-xl text-white">
                  No seed phrases <br /> or key backups
                </p>
              </div>
              <div className="flex flex-col items-center gap-5">
                <Image
                  src="/assets/images/earth.svg"
                  alt="Browser-based Icon"
                  width={100}
                  height={100}
                />
                <p className="text-center text-xl text-white">
                  Browser-based <br /> & no extensions
                </p>
              </div>
              <div className="flex flex-col items-center gap-5">
                <Image
                  src="/assets/images/confetti.svg"
                  alt="Safe Interactions Icon"
                  width={100}
                  height={100}
                />
                <p className="text-center text-xl text-white">
                  Safer interactions <br /> with contracts
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="flex flex-col items-center gap-8 px-6 py-12">
            <h2 className="text-center text-3xl font-bold text-white">
              Get your first Smart Account in seconds
            </h2>
            <Link
              href="/onboarding/internal"
              className="flex items-center justify-center rounded bg-white px-10 py-5 text-xl font-normal text-[#070707]"
            >
              START NOW
            </Link>
          </section>

          {/* Empathy Guide */}
          <section className="flex flex-col gap-8 px-6 py-12">
            <h2 className="text-3xl font-bold text-white">
              We were tired of clunky crypto UX...
            </h2>
            <p className="text-xl text-white">
              Obi was built to give you a seamless, secure way to manage assets
              conveniently and without compromise.
            </p>
            <p className="text-xl text-white">
              Self-custody is a human right. With Obi, avoid the common pitfalls
              of lost assets and navigate decentralized ecosystems effortlessly
              – while staying fully in control.
            </p>
          </section>

          {/* Sponsors */}
          <section className="flex flex-col items-center gap-10 px-6 py-12">
            <h2 className="text-primary text-center text-xl">
              With support from the best in crypto:
            </h2>
            <p className="text-primary text-center text-xl">
              Secret Network / LonghashX / Kado / WAGMI Ventures / RnR Capital /
              Shade Protocol / Blink Capital / Honest Pirate
            </p>
          </section>

          {/* Footer */}
          <footer className="bg-background flex flex-col items-center justify-between px-6 py-5 lg:flex-row">
            <p className="text-xl text-white">
              © 2024 Obi Technologies. All rights reserved.
            </p>
            <div className="flex space-x-10">
              <Link
                href="https://twitter.com/obi_wallet"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/assets/icons/twitter.svg"
                  alt="Twitter"
                  width={30}
                  height={30}
                />
              </Link>
              <Link
                href="https://t.me/obi_wallet"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/assets/icons/telegram.svg"
                  alt="Telegram"
                  width={30}
                  height={30}
                />
              </Link>
            </div>
          </footer>
        </section>
      </MainContainer>
    </>
  );
}
