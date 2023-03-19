import {
  CurrentAccount,
  MultisigWalletSchema,
  SinglesigWallet,
} from "./schema";
import {
  Chain,
  CosmosChain,
  cosmosChains,
  TerraChain,
  terraChains,
} from "../../chains";
import { FlexAccount, GatekeeperConfig } from "../gatekeeper-config";
import { AbstractSerialized } from "../migratable";
import { MultisigKey } from "../multisig-key";

// eslint-disable-next-line import/no-default-export
export interface MultisigWalletInterface {
  readonly schema: typeof MultisigWalletSchema;
  readonly id: string;
  readonly meta: {
    walletId: string;
    currentAccount: AbstractSerialized<typeof CurrentAccount> | null;
  };
  readonly chainId: Chain;
  readonly chain:
    | (typeof terraChains)[TerraChain]
    | (typeof cosmosChains)[CosmosChain];
  readonly isDemo: boolean;
  readonly proxyAddress: string;
  readonly address: string;
  readonly shortenedAddress: string | null;
  readonly currentAccountMeta: AbstractSerialized<typeof CurrentAccount> | null;
  readonly currentAccount:
    | AbstractSerialized<typeof SinglesigWallet>
    | AbstractSerialized<typeof FlexAccount>
    | null;
  readonly owner: MultisigKey;
  readonly gatekeeperConfig: GatekeeperConfig;
  readonly singlesigWallets: ReadonlyArray<
    AbstractSerialized<typeof SinglesigWallet>
  >;

  toJSON(): AbstractSerialized<typeof MultisigWalletSchema>;
  isOutdated(codeIds: {
    userAccount: number;
    spendLimitGatekeeper: number | null;
    debtGatekeeper: number | null;
  }): boolean;
  getAccount(
    account: AbstractSerialized<typeof CurrentAccount>
  ):
    | AbstractSerialized<typeof SinglesigWallet>
    | AbstractSerialized<typeof FlexAccount>;
  setCurrentAccount(
    account: AbstractSerialized<typeof CurrentAccount> | null
  ): void;
  setOwner(owner: MultisigKey): void;
  setGatekeeperConfig(gatekeeperConfig: GatekeeperConfig): void;
  upsertSinglesigWallet(
    singlesig: AbstractSerialized<typeof SinglesigWallet>
  ): void;
  removeSinglesigWallet(
    singlesig: AbstractSerialized<typeof SinglesigWallet>
  ): void;
}
