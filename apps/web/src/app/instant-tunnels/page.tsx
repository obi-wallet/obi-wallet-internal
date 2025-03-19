"use client";

import { Header } from "@/components";
import { MainContainer } from "@/layouts/root";
import Image from "next/image";
import Link from "next/link";

import ChainAssetSelector from "./chain-asset-selector";
const BASE_TUNNEL_EMBED_URL = "https://obi.money/embed/tunnel";
const url = new URL(BASE_TUNNEL_EMBED_URL);
url.searchParams.set(
  "from",
  "eip155:42161/native:0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
);
const TUNNEL_EMBED_URL = url.toString();

export default function InstantTunnelsPage() {
  return (
    <>
      <Header />
      <MainContainer>
        <section className="flex w-full flex-col gap-12 text-white">
          {/* Hero Section */}
          <section className="bg-background relative flex min-h-[80vh] flex-col justify-center gap-8 px-6 py-16 text-center text-white lg:flex-row lg:items-center lg:px-28 lg:text-left">
            <div className="lg:w-2/3">
              <h1 className="text-4xl font-normal uppercase lg:text-5xl">
                Onboard Users and Liquidity
                <br />
                <span className="font-bold">From Anywhere</span>
              </h1>
              <p className="mt-6 text-xl font-light">
                Users one-click into your ecosystem from any crypto or fiat
                currency
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
            <div className="hidden lg:block lg:w-1/3"></div>
          </section>

          {/* CTA Section */}
          <section className="mt-[-2rem] flex flex-col items-center gap-8 px-6 py-12 lg:px-28">
            <h2 className="text-3xl font-bold">
              Customize, Test, and Embed Now
            </h2>
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-center">
              <div className="w-full md:w-5/12 md:max-w-md">
                <ChainAssetSelector iframeId="tunnel-embed-demo" />
              </div>
              <div className="w-full md:w-7/12 md:max-w-xl">
                <div className="relative">
                  <iframe
                    id="tunnel-embed-demo"
                    src={TUNNEL_EMBED_URL}
                    className="mx-auto h-[600px] w-full rounded-lg border-0 bg-transparent"
                    allow="camera *; clipboard-write *; accelerometer *; autoplay *; encrypted-media *"
                  />
                  {/* Overlay to prevent interaction with iframe */}
                  <div
                    className="absolute inset-0 z-10 cursor-not-allowed bg-transparent"
                    aria-label="Preview only - use the controls on the left to customize"
                  />
                </div>
              </div>
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
                code="No code!"
              />
              <Step
                number="3"
                title="Tweak"
                description="Specify your destination asset and a default origin asset"
                code="https://obi.money/embed/tunnel?to=7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr&from=ETH"
              />
            </div>
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
    <div className="bg-background flex flex-col items-center gap-4 rounded-lg p-6 text-center">
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
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold text-black">
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
