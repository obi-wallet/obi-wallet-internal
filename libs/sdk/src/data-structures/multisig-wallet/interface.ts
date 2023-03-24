import { MultisigWalletSchema } from "./schema";
import {
  Chain,
  CosmosChain,
  cosmosChains,
  TerraChain,
  terraChains,
} from "../../chains";
import { Message } from "../../transactions";
import { FlexAccount } from "../flex-account";
import { GatekeeperConfig } from "../gatekeeper-config";
import { AbstractSerialized } from "../migratable";
import { MultisigKey } from "../multisig-key";
import { SinglesigWallet } from "../singlesig-wallet";

export type CurrentAccountMeta = {
  type: "flex-account" | "singlesig-wallet";
  id: string;
};
export interface WalletMeta {
  walletId: string;
  currentAccount: CurrentAccountMeta | null;
}

export interface MultisigWalletInterface {
  readonly schema: typeof MultisigWalletSchema;
  readonly id: string;
  readonly meta: WalletMeta;
  readonly chainId: Chain;
  readonly chain:
    | (typeof terraChains)[TerraChain]
    | (typeof cosmosChains)[CosmosChain];
  readonly isDemo: boolean;
  readonly proxyAddress: string;
  readonly address: string;
  readonly shortenedAddress: string | null;
  readonly currentAccountMeta: CurrentAccountMeta | null;
  readonly currentAccount: SinglesigWallet | FlexAccount | null;
  readonly owner: MultisigKey;
  readonly gatekeeperConfig: GatekeeperConfig;
  readonly singlesigWallets: ReadonlyArray<SinglesigWallet>;

  toJSON(): AbstractSerialized<typeof MultisigWalletSchema>;
  isOutdated(codeIds: {
    userAccount: number;
    spendLimitGatekeeper: number | null;
    debtGatekeeper: number | null;
  }): boolean;
  getAccount(account: CurrentAccountMeta): SinglesigWallet | FlexAccount | null;
  setCurrentAccount(account: CurrentAccountMeta | null): void;
  setOwner(owner: MultisigKey): void;
  setGatekeeperConfig(gatekeeperConfig: GatekeeperConfig): void;
  upsertSinglesigWallet(singlesig: SinglesigWallet): void;
  removeSinglesigWallet(singlesig: SinglesigWallet): void;

  canExecute({
    flexAccount,
    messages,
  }: {
    flexAccount: FlexAccount;
    messages: Message[];
  }): Promise<boolean>;
}
