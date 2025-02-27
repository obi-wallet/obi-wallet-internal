"use client";

import { Header } from "@/components";
import { MainContainer } from "@/layouts/root";
import Image from "next/image";
import Link from "next/link";

export default function InstantTunnelsPage() {
  return (
    <>
      <Header />
      <MainContainer>
        <section className="flex w-full flex-col gap-24 text-white">
          {/* Hero Section */}
          <section className="bg-background relative flex min-h-screen flex-col justify-center gap-8 px-6 py-20 text-center text-white lg:flex-row lg:items-center lg:px-28 lg:text-left">
            <div className="lg:w-2/3">
              <h1 className="text-4xl font-normal uppercase lg:text-5xl">
                Onboard Users and Liquidity<br />
                <span className="font-bold">From Anywhere</span>
              </h1>
              <p className="mt-6 text-xl font-light">
                Users one-click into your ecosystem from any crypto or fiat currency
              </p>
              <div className="mt-6 flex flex-col gap-5 lg:flex-row">
                <Link
                  href="https://docs.obi.money/instant-tunnels"
                  className="bg-primary flex items-center justify-center rounded px-10 py-5 text-xl font-normal text-[#070707] shadow"
                >
                  GET THE WIDGET
                </Link>
                <Link
                  href="https://github.com/obi-wallet/instant-tunnels"
                  className="text-accent flex items-center justify-center rounded bg-white px-10 py-5 text-xl font-normal"
                >
                  CHAT WITH US
                </Link>
              </div>
            </div>
            <div className="lg:w-1/3">
              <iframe
                src="https://obi.money/embed/tunnel"
                className="mx-auto h-[600px] w-full max-w-[400px] rounded-lg border-0 bg-transparent"
                allow="camera *; clipboard-write *; accelerometer *; autoplay *; encrypted-media *"
              />
            </div>
          </section>

          {/* Features Section */}
          <section className="flex flex-col items-center gap-16 px-6 py-12 lg:px-28">
            <h2 className="text-center text-3xl font-bold">
              Non-Custodial, Non-Hassle
            </h2>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon="/assets/icons/ghost.svg"
                title="Frontrun Prevention"
                description="The user's final intent is not revealed until it is executed"
              />
              <FeatureCard
                icon="/assets/icons/globe.svg"
                title="Universal Compatibility"
                description="Works with any common blockchain architecture, even Bitcoin"
              />
              <FeatureCard
                icon="/assets/icons/luggage.svg"
                title="Users From Anywhere"
                description="Even users with no wallet experience can get your asset with instant, non-custodial single sign-on accounts"
              />
            </div>
          </section>

          {/* How It Works Section */}
          <section className="flex flex-col gap-12 px-6 py-12 lg:px-28">
            <h2 className="text-center text-3xl font-bold">How It Works</h2>
            <div className="flex flex-col gap-8">
              <Step
                number="1"
                title="Copy"
                description="Copy the Instant Tunnels URL"
                code="https://obi.money/embed/tunnel"
              />
              <Step
                number="2"
                title="Paste"
                description="Embed it in your app or webpage"
                code={"No code!"}
              />
              <Step
                number="3"
                title="Tweak"
                description="Specify your destination asset and a default origin asset"
                code={`https://obi.money/embed/tunnel?to=7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr&from=ETH`}
              />
            </div>
          </section>

          {/* CTA Section */}
          <section className="flex flex-col items-center gap-8 px-6 py-12 text-center lg:px-28">
            <h2 className="text-3xl font-bold">
              Customize, Test, and Embed Now
            </h2>
            <div className="lg:w-1/3">
              <iframe
                src="https://obi.money/embed/tunnel"
                className="mx-auto h-[600px] w-full max-w-[400px] rounded-lg border-0 bg-transparent"
                allow="camera *; clipboard-write *; accelerometer *; autoplay *; encrypted-media *"
              />
            </div>
            <Link
              href="https://docs.obi.money/instant-tunnels"
              className="bg-primary flex items-center justify-center rounded px-10 py-5 text-xl font-normal text-[#070707] shadow"
            >
              GET THE WIDGET
            </Link>
          </section>
        </section>
      </MainContainer>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-background p-6 text-center">
      <Image src={icon} alt={title} width={48} height={48} />
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  code,
}: {
  number: string;
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-[#1A1A1A] p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-black">
          {number}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-gray-300">{description}</p>
      <pre className="mt-4 rounded bg-[#2A2A2A] p-4">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function PricingCard({
  title,
  price,
  features,
  ctaText,
  ctaLink,
  highlighted = false,
}: {
  title: string;
  price: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-6 rounded-lg p-6 ${
        highlighted ? "bg-primary text-black" : "bg-[#1A1A1A] text-white"
      }`}
    >
      <div className="text-center">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="mt-4 text-3xl font-bold">{price}</div>
      </div>
      <ul className="flex flex-col gap-4">
        {features.map((feature, index) => {return (
          <li key={index} className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        )})}
      </ul>
      <Link
        href={ctaLink}
        className={`mt-auto rounded px-6 py-3 text-center ${
          highlighted
            ? "bg-black text-white"
            : "bg-primary text-black"
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
} 