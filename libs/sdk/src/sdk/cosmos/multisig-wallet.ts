import warning from "tiny-warning";

import { CosmosClient } from "./client";
import { CosmosChain, cosmosChains } from "../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { AbstractMultisigWalletSdk } from "../abstract";
import { BroadcastTransactionResult, CodeIds, Coin } from "../common";
import { Messages } from "../messages";
import { Sdk } from "../sdk";

function notImplemented(message: string) {
  warning(false, message);
}

export class CosmosMultisigWalletSdk extends AbstractMultisigWalletSdk {
  protected chainId: CosmosChain;
  protected client: CosmosClient;

  public constructor({
    chainId,
    wallet,
  }: {
    chainId: CosmosChain;
    wallet: MultisigWallet;
  }) {
    super({ chainId, wallet });
    this.chainId = chainId;
    this.client = new CosmosClient(chainId);
  }
  protected async codeIdsQueryFn(): Promise<CodeIds> {
    return {
      userAccount: await this.sdk.contracts.codeId(this.wallet.proxyAddress),
      spendLimitGatekeeper: null,
      debtGatekeeper: null,
    };
  }

  protected async isOutdatedQueryFn(): Promise<boolean> {
    const codeIds = await this.codeIds();
    return codeIds.userAccount < this.chain.currentCodeId;
  }

  public async updateWallet(): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateWallet not implemented for Cosmos");
    return { approved: false };
  }

  public async updateOwner(_: MultisigKey): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateOwner not implemented for Cosmos");
    return { approved: false };
  }

  public async updateGatekeeperConfig(_: GatekeeperConfig): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateGatekeeperConfig not implemented for Cosmos");
    return { approved: false };
  }

  public async stake(_: {
    amount: Coin;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("stake not implemented for Cosmos");
    return { approved: false };
  }

  public async unstake(_: {
    amount: Coin;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("unstake not implemented for Cosmos");
    return { approved: false };
  }

  public async withdrawRewards(): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("withdrawRewards not implemented for Cosmos");
    return { approved: false };
  }

  protected get chain() {
    return cosmosChains[this.chainId];
  }

  protected get messages() {
    return Messages.chainId(this.chainId);
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }
}
