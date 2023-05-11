import * as R from "ramda";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Chain, CosmosChainId, TerraChainId } from "../../../chains";
import { AbstractClient } from "../../../clients";
import {
  FlexAccount,
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../../data-structures";
import { queryClient } from "../../../query-client";
import { Signer } from "../../../signers";
import { Message, SignedTransaction, wrapMessage } from "../../../transactions";
import { SignAndBroadcastTransactionUserInteraction } from "../../../user-interactions";
import { BroadcastTransactionResult, CodeIds, Token } from "../../common";
import { Messages } from "../../messages";
import { Sdk } from "../../sdk";
import { AbstractMultisigWalletSdk } from "../abstract";

export class CosmosSdkMultisigWalletSdk extends AbstractMultisigWalletSdk {
  protected chainId: CosmosChainId | TerraChainId;
  protected client: AbstractClient;

  public constructor({
    chainId,
    wallet,
    client,
  }: {
    chainId: CosmosChainId | TerraChainId;
    client: AbstractClient;
    wallet: MultisigWallet;
  }) {
    super({ chainId, wallet });
    this.chainId = chainId;
    this.client = client;
  }

  protected async codeIdsQueryFn(): Promise<CodeIds> {
    const addresses = {
      userAccount: this.wallet.proxyAddress,
      ...(await this.sdk.gatekeeper.contractAddresses(
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
    if ((await this.proposedOwner()) !== newOwner.address) {
      const response = await this.proposeUpdateOwner(newOwner);

      if (!response.approved || !response.payload.success) {
        return response;
      }
    }

    return await this.confirmUpdateOwner(newOwner);
  }

  public async proposedOwner() {
    try {
      const response = await this.client.queryContract({
        contract: this.wallet.proxyAddress,
        query: { pending_owner: {} },
        schema: z.object({ pending_owner: z.string() }),
      });
      return response.pending_owner;
    } catch (e) {
      return null;
    }
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
      await this.sdk.gatekeeper.contractAddresses(this.wallet.proxyAddress);
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
    amount: Token;
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
    amount: Token;
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
    const rewards = await this.sdk.staking.rewards(this.wallet.address);
    const validators = rewards.perDelegator
      .filter((delegator) => {
        return this.sdk.bank.enrichToken(delegator.rewards).amount > 0;
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

  public async canExecute({
    flexAccount,
    messages,
  }: {
    flexAccount: FlexAccount;
    messages: Message[];
  }): Promise<boolean> {
    const schema = z.object({
      can_execute: z.object({
        yes: z.string().optional(),
      }),
    });
    try {
      const responses = await this.client.queryContracts(
        messages.map((message) => {
          return {
            contract: this.wallet.proxyAddress,
            query: {
              can_execute: {
                funds: [],
                address: flexAccount.address,
                msg: { legacy: wrapMessage(message) },
              },
            },
            schema,
          };
        })
      );
      return responses.every((response) => !!response.can_execute.yes);
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  public async createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }): Promise<SignedTransaction> {
    return await this.createAndSignTransaction({ signer, messages });
  }

  public async broadcastSignedTransaction(
    signedTransaction: SignedTransaction
  ): Promise<BroadcastTransactionResult> {
    return await this.client.broadcastSignedTransaction(signedTransaction);
  }

  protected get chain() {
    return Chain.select<{
      accountCreatorAddress: string;
      currentCodeIds: {
        userAccount: number;
        spendLimitGatekeeper: number;
        debtGatekeeper: number;
      };
      startingUsdDebt: string;
    }>({
      chainId: this.chainId,
      onCosmosChain(chain) {
        return chain;
      },
      onLegacyCosmosChain() {
        throw new Error("Not a Cosmos SDK chain");
      },
      onTerraChain(chain) {
        return chain;
      },
    });
  }

  protected get messages() {
    return Messages.chainId(this.chainId);
  }

  protected get sdk() {
    return Sdk.chainId(this.chainId);
  }
}
