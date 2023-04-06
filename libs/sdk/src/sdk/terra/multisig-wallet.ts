import * as R from "ramda";
import invariant from "tiny-invariant";

import { TerraClient } from "./client";
import { TerraChain, terraChains } from "../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { queryClient } from "../../query-client";
import { SignAndBroadcastTransactionUserInteraction } from "../../user-interactions";
import { AbstractMultisigWalletSdk } from "../abstract";
import { BroadcastTransactionResult, CodeIds, Coin } from "../common";
import { Messages } from "../messages";
import { Sdk } from "../sdk";

export class TerraMultisigWalletSdk extends AbstractMultisigWalletSdk {
  protected chainId: TerraChain;
  protected client: TerraClient;

  public constructor({
    chainId,
    wallet,
  }: {
    chainId: TerraChain;
    wallet: MultisigWallet;
  }) {
    super({ chainId, wallet });
    this.chainId = chainId;
    this.client = new TerraClient(chainId);
  }

  protected async codeIdsQueryFn(): Promise<CodeIds> {
    const addresses = {
      userAccount: this.wallet.proxyAddress,
      ...(await this.sdk.gatekeeper.fetchContractAddresses(
        this.wallet.proxyAddress
      )),
    };

    const pairs = R.toPairs(addresses);
    const pairsWithCodeIds = await Promise.all(
      pairs.map(async ([key, address]) => {
        return [
          key,
          address ? await this.sdk.contracts.codeId(address) : null,
        ] as [string, number | null];
      })
    );
    return R.fromPairs(pairsWithCodeIds) as unknown as CodeIds;
  }

  protected async isOutdatedQueryFn(): Promise<boolean> {
    const codeIds = await this.codeIds();
    return (
      codeIds.userAccount < this.chain.currentCodeIds.userAccount ||
      codeIds.spendLimitGatekeeper === null ||
      codeIds.spendLimitGatekeeper <
        this.chain.currentCodeIds.spendLimitGatekeeper ||
      codeIds.debtGatekeeper === null ||
      codeIds.debtGatekeeper < this.chain.currentCodeIds.debtGatekeeper
    );
  }

  public async updateWallet(): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    if (!(await this.isOutdated())) {
      return Promise.resolve({ approved: false });
    }

    const codeIds = await queryClient.ensureQueryData(this.codeIdsQuery());
    return await SignAndBroadcastTransactionUserInteraction.start({
      messages: [
        this.messages.getUpdateWalletMessage({
          wallet: this.wallet,
          codeIds,
        }),
      ],
      demoMode: this.wallet.isDemo,
      cancelable: true,
      multisigKey: this.wallet.owner,
    });
  }

  public async updateOwner(newOwner: MultisigKey): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const response = await this.proposeUpdateOwner(newOwner);

    if (!response.approved || !response.payload.success) {
      return response;
    }

    return await this.confirmUpdateOwner(newOwner);
  }

  protected async proposeUpdateOwner(newOwner: MultisigKey): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const codeIds = await queryClient.ensureQueryData(this.codeIdsQuery());
    const message = this.messages.getProposeUpdateOwnerMessage({
      wallet: this.wallet,
      newOwner,
      codeIds,
    });
    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      demoMode: this.wallet.isDemo,
      cancelable: true,
      multisigKey: this.wallet.owner,
    });

    if (!response.approved) {
      return { approved: false };
    }

    if (response.approved && !response.payload.success) {
      console.error(response.payload.rawLog);
      return await this.proposeUpdateOwner(newOwner);
    }

    return response;
  }

  protected async confirmUpdateOwner(newOwner: MultisigKey): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const message = this.messages.getConfirmUpdateOwnerMessage({
      wallet: this.wallet,
      newOwner,
    });
    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      demoMode: this.wallet.isDemo,
      cancelable: true,
      multisigKey: newOwner,
    });

    if (!response.approved) {
      return { approved: false };
    }

    if (response.approved && !response.payload.success) {
      console.error(response.payload.rawLog);
      return await this.confirmUpdateOwner(newOwner);
    }

    return response;
  }

  public async updateGatekeeperConfig(
    newGatekeeperConfig: GatekeeperConfig
  ): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const { spendLimitGatekeeper, sessionKeyGatekeeper } =
      await this.sdk.gatekeeper.fetchContractAddresses(
        this.wallet.proxyAddress
      );
    invariant(
      spendLimitGatekeeper,
      "Spend limit gatekeeper address is not set"
    );
    invariant(
      sessionKeyGatekeeper,
      "Session key gatekeeper address is not set"
    );
    const messages = this.messages.getUpdateGatekeeperMessages({
      wallet: this.wallet,
      newGatekeeperConfig,
      spendLimitGatekeeper,
      sessionKeyGatekeeper,
    });

    return await SignAndBroadcastTransactionUserInteraction.start({
      messages,
      demoMode: this.wallet.isDemo,
      cancelable: true,
      multisigKey: this.wallet.owner,
    });
  }

  public async stake({
    amount,
    validator,
  }: {
    amount: Coin;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    return await SignAndBroadcastTransactionUserInteraction.start({
      messages: [
        this.messages.getStakeMessage({
          wallet: this.wallet,
          amount,
          validator,
        }),
      ],
      demoMode: this.wallet.isDemo,
      cancelable: true,
      walletMeta: this.wallet.meta,
    });
  }

  public async unstake({
    amount,
    validator,
  }: {
    amount: Coin;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    return await SignAndBroadcastTransactionUserInteraction.start({
      messages: [
        this.messages.getUnstakeMessage({
          wallet: this.wallet,
          amount,
          validator,
        }),
      ],
      demoMode: this.wallet.isDemo,
      cancelable: true,
      walletMeta: this.wallet.meta,
    });
  }

  public async withdrawRewards(): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    const rewards = await this.sdk.staking.fetchRewards(this.wallet.address);
    const validators = rewards.perDelegator
      .filter((delegator) => {
        return this.sdk.formatCoin(delegator.rewards).amount > 0;
      })
      .map((delegator) => {
        return delegator.address;
      });
    const messages = validators.map((validator) => {
      return this.messages.getWithdrawRewardsMessage({
        wallet: this.wallet,
        validator,
      });
    });
    return await SignAndBroadcastTransactionUserInteraction.start({
      messages,
      demoMode: this.wallet.isDemo,
      cancelable: true,
      walletMeta: this.wallet.meta,
    });
  }

  protected get chain() {
    return terraChains[this.chainId];
  }

  protected get messages() {
    return Messages.chainId(this.chainId);
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }
}
