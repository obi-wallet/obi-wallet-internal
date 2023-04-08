import * as R from "ramda";
import invariant from "tiny-invariant";

import { TerraBankSdk } from "./bank";
import { TerraClient } from "./client";
import { TerraContractsSdk } from "./contracts";
import { TerraGatekeeperSdk } from "./gatekeeper";
import { TerraStakingSdk } from "./staking";
import { tokens } from "./tokens";
import { TerraTransactionsSdk } from "./transactions";
import { TerraChain, terraChains } from "../../chains";
import { MultisigKey } from "../../data-structures";
import { SignAndBroadcastTransactionUserInteraction } from "../../user-interactions";
import { AbstractUserInteractionResponse } from "../../user-interactions/abstract";
import { AbstractSdk } from "../abstract";
import { BroadcastTransactionResult, Coin, FormattedCoin } from "../common";
import { Messages } from "../messages";

export class TerraSdk extends AbstractSdk {
  public bank: TerraBankSdk;
  public contracts: TerraContractsSdk;
  public gatekeeper: TerraGatekeeperSdk;
  public staking: TerraStakingSdk;
  public transactions: TerraTransactionsSdk;

  protected client: TerraClient;

  protected constructor(protected chainId: TerraChain) {
    super(chainId);
    this.client = new TerraClient(chainId);
    this.bank = new TerraBankSdk({
      chainId,
      client: this.client,
    });
    this.contracts = new TerraContractsSdk({
      chainId,
      client: this.client,
    });
    this.gatekeeper = new TerraGatekeeperSdk({
      chainId,
      client: this.client,
    });
    this.staking = new TerraStakingSdk({
      chainId,
      client: this.client,
    });
    this.transactions = new TerraTransactionsSdk({
      chainId,
      client: this.client,
    });
  }

  public get chain() {
    return terraChains[this.chainId];
  }

  public async createWallet({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<
    AbstractUserInteractionResponse<
      { proxyAddress: string },
      {
        description: string;
        originalPayload: BroadcastTransactionResult;
      }
    >
  > {
    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [
        Messages.chainId(this.chainId).getCreateWalletMessage(multisigKey),
      ],
      demoMode,
      cancelable: true,
      multisigKey,
    });

    if (!response.approved) return response;
    if (!response.payload.success)
      return {
        approved: true,
        payload: {
          success: false,
          description: "Transaction failed",
          originalPayload: response.payload,
        },
      };

    const { rawLog } = response.payload;
    try {
      invariant(rawLog, "No log found");
      // TODO: zod
      const { events } = JSON.parse(rawLog)[0] as {
        events: {
          type: string;
          attributes: { key: string; value: string }[];
        }[];
      };
      const instantiateEvent = events.find((e) => {
        return e.type === "instantiate";
      });
      const contractAddresses = instantiateEvent?.attributes.filter((a) => {
        return a.key === "_contract_address";
      });
      invariant(
        Array.isArray(contractAddresses) && contractAddresses.length > 0,
        "No contract address found"
      );
      return {
        approved: true,
        payload: {
          success: true,
          proxyAddress: contractAddresses[0].value,
        },
      };
    } catch (e) {
      return {
        approved: true,
        payload: {
          success: false,
          description: "Could not parse log",
          originalPayload: response.payload,
        },
      };
    }
  }

  public formatCoin(coin: Coin): FormattedCoin {
    if (!R.has(coin.denom, tokens)) {
      return super.formatCoin(coin);
    }

    const token = tokens[coin.denom as keyof typeof tokens];
    const denom =
      R.prop("base_denom", token) ??
      R.prop("denom", token) ??
      R.prop("symbol", token) ??
      coin.denom;

    return {
      icon: token.icon ? { uri: token.icon } : null,
      denom: (() => {
        if (denom.startsWith("u")) {
          return denom.slice(1).toUpperCase();
        }

        if (denom.startsWith("terra1")) {
          return "";
        }

        return denom;
      })(),
      digits: token.decimals,
      label: R.prop("name", token) ?? R.prop("symbol", token) ?? coin.denom,
      amount: parseInt(coin.amount, 10) / 10 ** token.decimals,
    };
  }

  public static chainId(chainId: TerraChain) {
    return new TerraSdk(chainId);
  }
}
