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
      <section className="px-6 text-center lg:min-h-full lg:px-28 lg:pt-44 lg:text-left">
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
              alt=""
              className="mx-auto mb-4"
              width="101"
              height="100"
              src="https://s3-alpha-sig.figma.com/img/59d5/96fe/3cadb6e407a972ec166fae5d4ac98327?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=LSKxPF-bXKIMbBm7MI27Xk4vjvBcOZqXSqn7-OG4joeLOdaCMUDCc8VbtxkcoLgxNzWQgDppocl6A30kQp~ydx-2FucD~QPTjJavPIYAQfyOp-2Byn1g0MzAWvRsc7YwtP1ZzLnJhfRKsks1qEWhVjOybuOF2vzsv7UV7qhwOVBkRs99kmSd-AM86ZRfsd06e5QSYq2gDSFyimK8gMTi-m68LcXzIDJdx4Nuq1Ju4aDy9fHEdhr6BmW4rLb9wTuaBC40-hZdTmP2wnWZ4W3G9-JZT5BP9n0yF3l1gahg0-oLr7QDJ8ia~DZH4ENSPWQ-kX1W~xHxXyswkznYAcLYXA__"
            />
            <p className="text-sm lg:text-2xl">
              Risky key set up <br /> and lost funds
            </p>
          </div>
          <div>
            <Image
              alt=""
              className="mx-auto mb-4"
              width="101"
              height="100"
              src="https://s3-alpha-sig.figma.com/img/59d5/96fe/3cadb6e407a972ec166fae5d4ac98327?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=LSKxPF-bXKIMbBm7MI27Xk4vjvBcOZqXSqn7-OG4joeLOdaCMUDCc8VbtxkcoLgxNzWQgDppocl6A30kQp~ydx-2FucD~QPTjJavPIYAQfyOp-2Byn1g0MzAWvRsc7YwtP1ZzLnJhfRKsks1qEWhVjOybuOF2vzsv7UV7qhwOVBkRs99kmSd-AM86ZRfsd06e5QSYq2gDSFyimK8gMTi-m68LcXzIDJdx4Nuq1Ju4aDy9fHEdhr6BmW4rLb9wTuaBC40-hZdTmP2wnWZ4W3G9-JZT5BP9n0yF3l1gahg0-oLr7QDJ8ia~DZH4ENSPWQ-kX1W~xHxXyswkznYAcLYXA__"
            />
            <p className="text-sm lg:text-2xl">
              Multiple interfaces <br /> to manage assets
            </p>
          </div>
          <div>
            <Image
              alt=""
              className="mx-auto mb-4"
              width="101"
              height="100"
              src="https://s3-alpha-sig.figma.com/img/59d5/96fe/3cadb6e407a972ec166fae5d4ac98327?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=LSKxPF-bXKIMbBm7MI27Xk4vjvBcOZqXSqn7-OG4joeLOdaCMUDCc8VbtxkcoLgxNzWQgDppocl6A30kQp~ydx-2FucD~QPTjJavPIYAQfyOp-2Byn1g0MzAWvRsc7YwtP1ZzLnJhfRKsks1qEWhVjOybuOF2vzsv7UV7qhwOVBkRs99kmSd-AM86ZRfsd06e5QSYq2gDSFyimK8gMTi-m68LcXzIDJdx4Nuq1Ju4aDy9fHEdhr6BmW4rLb9wTuaBC40-hZdTmP2wnWZ4W3G9-JZT5BP9n0yF3l1gahg0-oLr7QDJ8ia~DZH4ENSPWQ-kX1W~xHxXyswkznYAcLYXA__"
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
              alt=""
              className="mx-auto mb-4"
              width="65"
              height="64"
              src="https://s3-alpha-sig.figma.com/img/3068/1d1f/48321e243667ce3ef6f4ee7252c3cdae?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=hd-yES3zPnMCaH1qdx0SNiyClIPSHIL~E0Ei3Za1Fv5PeZEQLVpSmTN~ZnYlogjaeZqSaUxl3KmKUrcCkDy0slp6MRQMAau4yHNmmlvBLabi1BfuuPtBX~Z5Imwj1PuxQ~7ax7e8V4ytBu9F1TBbMV3HCJNsyuS6eq3oPF0KzdpZI8HdCBCGSJERa~rykvwXbLD8~xn7IJi645wb60bI9oc7FAtguQ~1w7~PGuDHfedFyHXCQ91JbVgeR2jhqisfch8Eb-BbovZAUFwrwqh9NKYNgSHeTMuQ-c7rfDM6kpb8uByejPkmKI-YLQXA1k4cH--Xy8kAJWAitjfl1IGoug__"
            />
            <p>
              Custom key setup <br />
              for convenient transactions <br /> and recoverability
            </p>
          </div>
          <div>
            <Image
              alt=""
              className="mx-auto mb-4"
              width="65"
              height="64"
              src="https://s3-alpha-sig.figma.com/img/c3d4/eaa5/1613b46b311bd1d980eccb8e91a798a6?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=n01VEPp5GKcRgDbG1gDUXLgSUFXdA~h6FZxzVpHm8dX3dxHNUh2SUPH0IvKyQq94VdQ5ayV1tAoeOQVOBsK0Kf9Pz-AgdT8IZPMj6wbk2LxHbG~OV6niASSNgUJ-SWk6E4Eetds1e1atg-8I32HZtc4o8EVOSwpu0CMsusjZtpHXddNMLy-5C0L9WA4MwyGoMEbZ9u-diVbzTRXRWaGMfB6DUJwwcAgQiZIKPB~lXBCjT~~XsTqdv0YFaImEQeGuwL6d74s8IkaIjVG--Lbtv9qTt5uo~AwL-Sn8P2RBi8TNFVZ7gBz96ewQhHkMI17CWBR-Vow5DK9Qcz85szl0pg__"
            />
            <p>
              Multi-chain accounts for
              <br />
              EVM, L2s, Cosmos + <br /> Solana & Bitcoin (soon)
            </p>
          </div>
          <div>
            <Image
              alt=""
              className="mx-auto mb-4"
              width="65"
              height="64"
              src="https://s3-alpha-sig.figma.com/img/77e4/9b73/458959d599551d09bcd35998cba3f716?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=nkkm0xy6jJ6WqRh7zHlI6MnoWeWm~2qbY4y5~IUKTmOyY4OOJ7KZuSOlePtR7Hj-NhdMDPqt1wZC6w6WWCPJ2CI~hMNgJg2ieyGgpNwTRavkMI6zxlOIH8itINOy~89l5W1GVn~xaIA-FpymRQ0MFYX1N4GnJKj2uy8Ktomz7W-aZqN~nFl0CdWJvbJ-r2Va8nQhmS-1lt2q8NOxNdl94EDEtiqAdqjb~qirsqFpX3Cqzt4alLHmOtlb8Ww8pOuM7U5yLZEnT~u5Z6eG7zNu5xr~QZGTn28vKx~c72NBW5zQxvqApEAd7HpMKiIL1s9kBHLs-QQkCo-Dc42uh7lLxA__"
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
      <section className="px-20 py-8 lg:min-h-full lg:py-12">
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
            alt=""
            width="124"
            height="44"
            src="https://s3-alpha-sig.figma.com/img/e5ef/2375/8d904711709a74b968b0358b233fa51d?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=VRzyUXGV8-kX9LthfrJf5B00s3NhGxq4W1Qdt8HeFvIkF59ByctaQ9cvpa8wtYNmOs3iN6w5KsfW0YX3Cjar7YNrqL198M21L3h19b-aI~XRC69-~DfbJ7TvrKN7x0ZAw0YQIxdmYF~7PWITEHvFNwKZxbJN9QDwdlbtkM85RyHDAFTQBCrhqhbWX7ZTN3Rt9r~n0D~NFU03Tldw-9KbgtNLrPc7SQzRnkWWQl4Sh6BuDjwaf1QiRyAemgBmcue6EHl9HqQ3ZyxdUHVKqYAEFq0FWR7TRc5fV2TufFgi7oz85W2EVMnNDQYK40CB27QvK-umw9n-pLKm-Cwtdw-U6Q__"
          />
          <Image
            alt=""
            width="112"
            height="44"
            src="https://s3-alpha-sig.figma.com/img/c709/1804/e374700eb31fc9da5c15def50018dd03?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=XfyVHgoO12yy6D4f3I3yQmWa1i2jqbeQcMADryntCoXwCOPHk-nlUTbTi3-RCfBuuqox6FZkaMkh-ei4BfPl3nh~AMl1oLmNoyEWePvbgkJiYrmQu-ntYqrrZd27a0H2oImnBjciaqEn2Q0vlSUWyDnuqJuafOq4Vo0UR1uG03P6hTv0CnnRixgRa-K2hnW8RjDG1aS78K9DPKyfrlRZLP0X~34dh1-r9O5UqlBdZadwNfAOKbG08kMmiL8ErTpKKYRqfETpc9n1Aa2EhgmNwW3jJFsN9iMBmPhpAaRN2ZMg17TtnDRI52ezegZiEQX-JemfFMpg24ej2OcQZc2q~Q__"
          />
          <Image
            alt=""
            width="142"
            height="40"
            src="https://s3-alpha-sig.figma.com/img/086c/9f95/37caef8c4ec10a68f75e9b5d15e753f7?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=hxUUtVV~-QD~33AAFI~3rSiQzmN~fAdfmaancTH6X9mAfboKcjp51KwzUObPl2HBPUw54BvBhPzcmuaxiK11uszcSyFtddPalGLg636IzIkBGOa5UP9CRL2ddr6oTYFvC0NmTY7kSRGNAizhALoe6L1ERJ5jBsm73At-jS2r3-5HAx-iSbHk~tOUtBKpGD8RM6wAZ2JFbQrYc8hP2hLeFcDS4y8CI9gUjt6UclLrcz4aIwFm3W16DNmZ63DfZarc1QOGMATSppx3i7Mog1AsRtaq9I8O7v8TqXAkXvlQQv4TTcE6pDLcgqF0xTqJzTIEaERfGfAxFTAlK7D6AquBEA__"
          />
          <Image
            alt=""
            width="140"
            height="36"
            src="https://s3-alpha-sig.figma.com/img/d741/1a65/7d1d09732868ea0e8a11d39403f1da1c?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=JUOoGo3KT3qomj6B35axekU4ARxQ8D0wmGxdXrmAETpjI18~gG59NTpLbVfQ6UnY4IGzyEkXwO2eiSum9QpO1hYqogu~vqFHZ-eazxsIBExGwmkmvP3GqDHhSmUPBtdEpKjrBcWnrOfqNq0dSkIApsWCHgbXibUOYWV547HkHycIt7A~PoL~B0bqITn~R8wbG6maUAKrwxRqElBTVlwELlYuEgjSizFsipx5KuJ3EhHfmppyUgNLry2TkG-dZgyeZGZCV40qlG2FOgwmgZxgc5ERKeVTKZvmZCE047nkcwE9ZG1DfjGTCBGWKY4RwZ5CO8OMZytE45~RHEcKTiUt1Q__"
          />
          <Image
            alt=""
            width="144"
            height="48"
            src="https://s3-alpha-sig.figma.com/img/fc10/f768/1615435e5a460a0ffe2fb9dcefd58464?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Y~O6vhlHyGjAn-TnqH-ohsONhDIgylMCqklwN1FxLPq0HV4q8PDDrGntFWE2P31Po4286l6PIKMGx36dWWMP9OB-Tdt2t9zNtDhsW~Uo4tPGwldAM~yf72Mnd~ZAvzhzIZRmqi2SKm4Yh-U2PD5oQYGkFaPx9kIm8I2vjAS1CEjkjiGK7PaIY22H~gvM-t--twjTuBtYM0VGoWTsodOAww89apUkate0FbhA0jSyFW3jdEmqjT2NGemNXMD6W5Sge3ngRMNW6P1SIgJDk0u9uYxEWJnbn~cx7cKsRjb1sS9F4a5ZyoQUiyG0fq6N8l341n-bk8u5QoVTCZgHdqmjCg__"
          />
        </div>
      </section>
    </section>
  );
});
