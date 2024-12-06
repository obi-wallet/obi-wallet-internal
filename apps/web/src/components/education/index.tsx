"use client";

import { UnderlineLink } from "@/components/links";
import { useStore } from "@/contexts/store";
import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect, useRef, TouchEvent, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";

interface TopicLinkProps {
  topicId: string;
  children: ReactNode;
}

function TopicLink({ topicId, children }: TopicLinkProps) {
  const { educationStore } = useStore();
  return (
    <button
      onClick={() => {
        return educationStore.setTopicById(topicId);
      }}
      className="text-primary hover:text-primary/80 hover:underline"
    >
      {children}
    </button>
  );
}

interface TopicContent {
  title: string;
  description: ReactNode;
}

const TOPIC_CONTENT: Record<string, TopicContent> = {
  confirm_asset: {
    title: "Confirm Asset Details",
    description: (
      <>
        <p>Here, you can adjust the details for the token you're adding.</p>
        <p>
          Usually, you don't need to change any details here. However, if your
          token is uncommon and was not found, please manually specify a name,
          ticker, and the number of decimal places the token uses (usually 18
          for Ethereum tokens, 9 to 18 for Solana, and 6 for Cosmos SDK chains).
        </p>
      </>
    ),
  },
  chain_selection: {
    title: "Select Chain",
    description: (
      <>
        <p>
          Choose the blockchain network containing the token you would like to
          import. Choosing the incorrect network will generally result in no
          token being found.
        </p>
      </>
    ),
  },
  token_contract_address: {
    title: "Token Contract Address",
    description: (
      <>
        <p>
          Enter the smart contract address of the token you want to import. You
          can find this:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>On the token's official website or documentation</li>
          <li>
            Through blockchain explorers like{" "}
            <UnderlineLink href="https://etherscan.io">Etherscan</UnderlineLink>
            , <UnderlineLink href="https://arbiscan.io">Arbiscan</UnderlineLink>
            ,{" "}
            <UnderlineLink href="https://basescan.org">Basescan</UnderlineLink>,{" "}
            <UnderlineLink href="https://bscscan.com">BscScan</UnderlineLink>,{" "}
            <UnderlineLink href="https://solscan.io">Solscan</UnderlineLink>, or{" "}
            <UnderlineLink href="https://www.mintscan.io">
              MintScan
            </UnderlineLink>
          </li>
          <li>From trusted token lists and directories</li>
        </ul>
        <p className="mt-2 text-yellow-400">
          Always verify the contract address from official sources to avoid
          importing fake or malicious tokens.
        </p>
      </>
    ),
  },
  dashboard_home: {
    title: "Dashboard",
    description: (
      <>
        <p>
          Welcome to your Obi dashboard! This is a secure place to use
          blockchain assets and apps with advanced new account features like
          non-custodial recovery. Here on the main Dashboard page, you can:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            View and manage your{" "}
            <TopicLink topicId="assets_info">assets</TopicLink>
          </li>
          <li>
            Track your <TopicLink topicId="balances_info">balances</TopicLink>{" "}
            across different chains
          </li>
          <li>
            <TopicLink topicId="import_asset_info">
              Import custom tokens
            </TopicLink>
          </li>
          <li>
            Initiate{" "}
            <TopicLink topicId="transactions_info">transactions</TopicLink>
          </li>
        </ul>
      </>
    ),
  },
  buy_crypto: {
    title: "Buy Crypto",
    description: (
      <>
        <p>
          Purchase cryptocurrency directly to your Obi. Kado offers excellent
          rates and onboarding speed. No KYC data is available to Obi or to any
          apps that connect to Obi.
        </p>
      </>
    ),
  },
  security_settings: {
    title: "Security Settings",
    description: (
      <>
        <p>
          Manage your wallet's security with multiple authentication methods.
          Obi uses a unique multi-key approach for enhanced security. This way,
          if one key is lost or stolen, you can update your multi-key setup and
          continue business as usual.
        </p>
        <p>Four different types of keys are currently supported:</p>
        <ul className="mt-1 list-disc pl-4">
          <li>
            <TopicLink topicId="passkey_info">Passkey</TopicLink> - using device
            secure hardware
          </li>
          <li>
            <TopicLink topicId="telegram_key_info">Telegram</TopicLink> -
            non-custodial Telegram bot signing
          </li>
          <li>
            <TopicLink topicId="phone_key_info">Phone</TopicLink> - SMS codes
            hardened by your security answer
          </li>
          <li>
            <TopicLink topicId="cloud_key_info">Cloud</TopicLink> - an encrypted
            key stored on your Google Drive. More providers coming soon.
          </li>
        </ul>
        <p>
          You can also configure how many{" "}
          <TopicLink topicId="keys_required_info">keys are required</TopicLink>{" "}
          to sign transactions.
        </p>
      </>
    ),
  },
  app_connect: {
    title: "App Connect",
    description: (
      <>
        <p>
          Connect your Obi wallet to external applications and DApps securely
          using WalletConnect.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <TopicLink topicId="wallet_connect_info">
              Connect to an app in another tab or on another device using
              WalletConnect
            </TopicLink>
          </li>
          <li>
            Manage your{" "}
            <TopicLink topicId="dapp_connections">open connections</TopicLink>
          </li>
        </ul>
      </>
    ),
  },
  edit_assets: {
    title: "Edit Assets Mode",
    description: (
      <>
        <p>
          Edit mode lets you customize which assets appear in your dashboard.
          You can:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Hide rarely used or spam tokens by disabling them</li>
          <li>Import new tokens that aren't automatically detected</li>
          <li>Configure viewing keys for Secret Network tokens</li>
        </ul>
        <p className="mt-2">
          Changes only affect how assets are displayed - your actual balances
          remain safe on the blockchain.
        </p>
      </>
    ),
  },
  passkey_info: {
    title: "Passkey",
    description: (
      <>
        <p>
          A Passkey is a secure, passwordless authentication method that uses
          your device's built-in security features.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            Uses biometric authentication (Face ID, Touch ID, Windows Hello,
            etc.) or device PIN
          </li>
          <li>Stored securely on your device</li>
          <li>
            Can be used across devices: you can use a passkey on your phone on
            your desktop by using a QR code
          </li>
          <li>Your key cannot be stored by Obi or accessed by third parties</li>
        </ul>
      </>
    ),
  },
  telegram_key_info: {
    title: "Telegram Key",
    description: (
      <>
        <p>
          A Telegram Key uses your Telegram account as a secure authentication
          method.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Your Telegram information is unknown to Obi</li>
          <li>
            Protected by your security question, in case you leave your phone
            unlocked
          </li>
          <li>
            Telegram codes only provide signatures to the app, not private key
            material
          </li>
        </ul>
      </>
    ),
  },
  phone_key_info: {
    title: "Phone Key",
    description: (
      <>
        <p>
          A Phone Key uses your phone number for secure SMS-based
          authentication.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Uses SMS verification codes</li>
          <li>
            Protected by your security question, in case you leave your phone
            unlocked
          </li>
          <li>
            Resistant to SIM swapping and other attacks thanks to your security
            answer and security notifications
          </li>
          <li>
            SMS codes only provide signatures to the app, not private key
            material
          </li>
        </ul>
      </>
    ),
  },
  cloud_key_info: {
    title: "Cloud Key",
    description: (
      <>
        <p>
          A Cloud Key is stored in your cloud storage for secure backup and
          recovery.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Stored in your Google Drive</li>
          <li>Protected by your cloud account security</li>
          <li>
            Recommended for use in a multi-key setup with 3 or more keys, in
            case your cloud account is ever compromised
          </li>
        </ul>
      </>
    ),
  },
  keys_required_info: {
    title: "Keys Required to Sign",
    description: (
      <>
        <p>
          Choose how many keys are needed to sign transactions and access your
          wallet.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            Higher numbers provide more security but require more keys for
            access
          </li>
          <li>Lower numbers are more convenient but provide less security</li>
          <li>We recommend 2 keys for balanced security and convenience</li>
          <li>
            Updates of Obi coming soon will allow easy session keys, allowing
            you to temporarily sign with just 1 key for your session
          </li>
        </ul>
      </>
    ),
  },
  recipient_address_info: {
    title: "Recipient Address",
    description: (
      <>
        <p>Enter the wallet address where you want to send your assets.</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Address must be on the same chain as the asset you're sending</li>
          <li>Double-check the address to avoid losing funds</li>
          <li>Be careful NOT to send to a token contract address by mistake</li>
          <li>Consider sending a small test amount first</li>
        </ul>
        <p className="mt-2 text-yellow-400">
          As a rule, transactions are final and cannot be reversed - verify the
          address carefully!
        </p>
      </>
    ),
  },
  send_amount_info: {
    title: "Send Amount",
    description: (
      <>
        <p>Choose how much of your selected asset to send.</p>
      </>
    ),
  },
  memo_field_info: {
    title: "Transaction Memo",
    description: (
      <>
        <p>Add an optional note to your transaction.</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            Some exchanges require specific memo text for certain blockchains
          </li>
          <li>You can also use memos to note the purpose of transaction</li>
          <li>Memos are publicly visible on blockchain explorers</li>
        </ul>
      </>
    ),
  },
  receive_chain_info: {
    title: "Receive on Chain",
    description: (
      <>
        <p>Select which blockchain network you want to receive assets on.</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Ensure the sender is using the same chain</li>
          <li>
            Your receive address on one EVM chain is the same on others, so you
            can receive to the same address on Ethereum, Arbitrum, Base, and so
            on
          </li>
        </ul>
      </>
    ),
  },
  receive_address_info: {
    title: "Your Receive Address",
    description: (
      <>
        <p>
          This is your wallet address for receiving assets on the selected
          chain.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Click to copy the address</li>
          <li>
            Share this address with the sender or ask them to scan the QR code
          </li>
        </ul>
        <p className="mt-2">
          This address will always be yours; however, be aware that sometimes,
          different chains do have different addresses. Double check which chain
          the sender wants to send funds on.
        </p>
      </>
    ),
  },
  send_chain_asset_info: {
    title: "Select Asset to Send",
    description: (
      <>
        <p>
          Choose which asset you want to send from your wallet. If you don't see
          a token which you have in your wallet, go to the Dashboard and import
          the missing token.
        </p>
      </>
    ),
  },
  wallet_connect_info: {
    title: "How to App Connect with Obi",
    description: (
      <>
        <ol className="list-inside list-decimal space-y-4">
          <li>Open the app you want to connect to in a browser tab.</li>
          <li>
            If you have used a different wallet with this app, you may need to
            disconnect.
          </li>
          <li>
            Find the <strong className="font-bold">WalletConnect</strong> option
            and display the QR code. In some apps, you may need to select{" "}
            <strong className="font-bold">Keplr Mobile</strong> or find an
            additional WalletConnect button to display the code.
            <div className="my-2">
              <img
                className="w-full object-contain"
                src="/assets/images/app-connect-pairing.png"
                width={800}
                height={600}
                alt="WalletConnect pairing screen"
              />
            </div>
          </li>
          <li>
            Copy the WalletConnect URL and paste it into the Obi App Connect
            tab.
          </li>
        </ol>
      </>
    ),
  },
  import_new_asset: {
    title: "Track a New Asset",
    description: (
      <>
        <p>Add custom tokens to your wallet by importing them manually.</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Select the blockchain network for your token</li>
          <li>Enter the token's contract address</li>
          <li>
            If the token is known, information about it will be auto-filled.
            Otherwise, you can enter it
          </li>
        </ul>
        <p className="mt-2 text-yellow-400">
          Always verify the contract address carefully to ensure you're
          importing the correct token.
        </p>
      </>
    ),
  },
};

export const Education = observer(function Education() {
  const { educationStore } = useStore();
  const topic = educationStore.currentTopic;
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  // Determine if the topic was set by an info icon click (for mobile)
  const isInfoIconTopic = topic?.source === "info-icon";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only handle click outside for mobile drawer
      if (!isInfoIconTopic) return;

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const target = event.target as HTMLElement;
      // Don't dismiss if clicking info icon or inside drawer
      if (target.closest(".info-icon") || drawerRef.current?.contains(target)) {
        return;
      }

      // Only close the drawer without clearing the topic
      educationStore.setDrawerOpen(false);
    }

    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [isInfoIconTopic, educationStore]);
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    startY.current = touch.clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    if (!touch) return;

    currentY.current = touch.clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 50) {
      // If dragged down more than 50px
      educationStore.setDrawerOpen(false);
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const content = topic ? TOPIC_CONTENT[topic.id] : null;

  // Only render the drawer if we have content
  if (!isInfoIconTopic || !content) {
    return (
      <div className="education-panel h-full w-full space-y-2 overflow-auto p-3 text-gray-300 max-md:hidden">
        {!content ? (
          <>
            <h2 className="text-lg font-medium text-gray-300">About Obi</h2>
            <p className="text-sm text-gray-300">
              Welcome to Obi, a secured all-chain manager for all your assets
              and apps. Select any info icon{" "}
              <FaQuestionCircle className="inline-block text-gray-400" /> across
              the interface to learn more about specific features and
              components.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium text-gray-300">
              {content.title}
            </h2>
            <div className="space-y-2 text-sm leading-relaxed text-gray-300">
              {content.description}
            </div>
          </>
        )}
      </div>
    );
  }

  // Add drawer classes based on state
  const drawerClasses = cn(
    "education-drawer fixed inset-x-0 bottom-0 z-50 bg-background-main md:hidden",
    "transition-transform duration-300 ease-in-out",
    educationStore.drawerOpen ? "translate-y-0" : "translate-y-full",
    "h-[85vh]", // Set height to 85% of viewport
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div
        ref={drawerRef}
        className={drawerClasses}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative h-full">
          {/* Close button */}
          <button
            onClick={() => {
              return educationStore.setDrawerOpen(false);
            }}
            className="hover:text-primary absolute right-2 top-2 p-2 text-white"
            aria-label="Close education panel"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Handle */}
          <div className="handle-area flex h-6 w-full cursor-pointer items-center justify-center bg-transparent">
            <div className="h-1 w-12 rounded-full bg-gray-500" />
          </div>

          {/* Content */}
          <div className="drawer-content pb-safe overflow-auto p-4">
            {content && (
              <>
                <h2 className="text-lg font-medium text-gray-300">
                  {content.title}
                </h2>
                <div className="mt-2 space-y-2 text-sm leading-relaxed text-gray-300">
                  {content.description}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Panel */}
      <div className="education-panel h-full w-full space-y-2 overflow-auto p-3 text-gray-300 max-md:hidden">
        <h2 className="text-lg font-medium text-gray-300">{content.title}</h2>
        <div className="space-y-2 text-sm leading-relaxed text-gray-300">
          {content.description}
        </div>
      </div>
    </>
  );
});
