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
                ONBOARD ANY TARGET MARKET<br />
                <span className="font-bold">with Universal Tunnel Widgets</span>
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
              Why Choose Instant Tunnels?
            </h2>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon="/assets/icons/speed.svg"
                title="Lightning Fast"
                description="Sub-second cross-chain message delivery with guaranteed finality"
              />
              <FeatureCard
                icon="/assets/icons/security.svg"
                title="Bank-Grade Security"
                description="End-to-end encryption with quantum-resistant cryptography"
              />
              <FeatureCard
                icon="/assets/icons/scalability.svg"
                title="Infinite Scalability"
                description="Handle millions of messages per second with zero congestion"
              />
              <FeatureCard
                icon="/assets/icons/compatibility.svg"
                title="Universal Compatibility"
                description="Works with any blockchain that supports basic cryptographic primitives"
              />
              <FeatureCard
                icon="/assets/icons/simplicity.svg"
                title="Simple Integration"
                description="Add cross-chain messaging to your dApp in less than 10 lines of code"
              />
              <FeatureCard
                icon="/assets/icons/cost.svg"
                title="Cost Effective"
                description="Pay only for what you use with transparent, predictable pricing"
              />
            </div>
          </section>

          {/* How It Works Section */}
          <section className="flex flex-col gap-12 px-6 py-12 lg:px-28">
            <h2 className="text-center text-3xl font-bold">How It Works</h2>
            <div className="flex flex-col gap-8">
              <Step
                number="1"
                title="Initialize"
                description="Add the Instant Tunnels SDK to your project and initialize with your API key"
                code="npm install @obi/instant-tunnels"
              />
              <Step
                number="2"
                title="Configure"
                description="Set up your source and destination chains with a simple configuration object"
                code={`const tunnel = new InstantTunnel({
  sourceChain: 'ethereum',
  destChain: 'cosmos',
  apiKey: 'your-api-key'
})`}
              />
              <Step
                number="3"
                title="Send Messages"
                description="Start sending cross-chain messages with a single function call"
                code={`await tunnel.sendMessage({
  message: 'Hello Cross-Chain World!',
  destination: 'cosmos1...'
})`}
              />
            </div>
          </section>

          {/* Pricing Section */}
          <section className="flex flex-col items-center gap-12 px-6 py-12 lg:px-28">
            <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <PricingCard
                title="Developer"
                price="Free"
                features={[
                  "Up to 1,000 messages/month",
                  "Basic support",
                  "2 chains supported",
                  "Community access"
                ]}
                ctaText="Start Free"
                ctaLink="https://docs.obi.money/instant-tunnels/get-started"
              />
              <PricingCard
                title="Business"
                price="$99/mo"
                features={[
                  "Up to 100,000 messages/month",
                  "Priority support",
                  "All chains supported",
                  "Advanced analytics"
                ]}
                ctaText="Start Trial"
                ctaLink="https://docs.obi.money/instant-tunnels/business"
                highlighted
              />
              <PricingCard
                title="Enterprise"
                price="Custom"
                features={[
                  "Unlimited messages",
                  "24/7 support",
                  "Custom integrations",
                  "SLA guarantee"
                ]}
                ctaText="Contact Us"
                ctaLink="https://docs.obi.money/instant-tunnels/enterprise"
              />
            </div>
          </section>

          {/* CTA Section */}
          <section className="flex flex-col items-center gap-8 px-6 py-12 text-center lg:px-28">
            <h2 className="text-3xl font-bold">
              Ready to Add Cross-Chain Messaging?
            </h2>
            <p className="text-xl">
              Get started with Instant Tunnels today and unlock the full potential of cross-chain communication.
            </p>
            <Link
              href="https://docs.obi.money/instant-tunnels"
              className="bg-primary mt-4 inline-flex items-center justify-center rounded px-10 py-5 text-xl font-normal text-[#070707] shadow"
            >
              Start Building Now
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
    <div className="flex flex-col items-center gap-4 rounded-lg bg-[#1A1A1A] p-6 text-center">
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