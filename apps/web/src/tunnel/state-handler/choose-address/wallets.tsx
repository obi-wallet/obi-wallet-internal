import { AsyncButton } from "@/ui/button";
import { ReactNode } from "react";

export function PhantomWallet({
  label,
  onClick,
}: {
  label: string;
  onClick: () => Promise<void>;
}) {
  return (
    <BaseWallet onClick={onClick}>
      <img
        src="/assets/icons/phantom.svg"
        alt=""
        width={36}
        height={30}
        className="mr-4"
      />
      <WalletLabel label={label} />
    </BaseWallet>
  );
}

export function ObiWallet({
  label,
  onClick,
}: {
  label: string;
  onClick: () => Promise<void>;
}) {
  return (
    <BaseWallet onClick={onClick}>
      <img
        src="/assets/icons/obi.svg"
        alt=""
        width={60}
        height={30}
        className="mr-4"
      />
      <WalletLabel label={label} />
    </BaseWallet>
  );
}

export function GenericWallet({
  label,
  onClick,
}: {
  label: string;
  onClick: () => Promise<void>;
}) {
  return (
    <BaseWallet onClick={onClick}>
      <WalletLabel label={label} />
    </BaseWallet>
  );
}

function BaseWallet({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => Promise<void>;
}) {
  return (
    <AsyncButton
      className="mt-2 !h-[70px] w-full"
      variant="primary"
      onClick={onClick}
    >
      {children}
    </AsyncButton>
  );
}

function WalletLabel({ label }: { label: string }) {
  return <span className="text-xl">{label}</span>;
}
