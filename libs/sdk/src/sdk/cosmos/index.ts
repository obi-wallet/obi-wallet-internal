import { StdFee } from "@cosmjs/amino";
import { createWasmAminoConverters } from "@cosmjs/cosmwasm-stargate";
import { coins } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFeegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  isDeliverTxSuccess,
} from "@cosmjs/stargate";
import { createVestingAminoConverters } from "@cosmjs/stargate/build/modules";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import warning from "tiny-warning";

import { CosmosBankSdk } from "./bank";
import { CosmosClient } from "./client";
import { CosmosContractsSdk } from "./contracts";
import { CosmosGatekeeperSdk } from "./gatekeeper";
import { OfflineAminoSigner } from "./offline-amino-signer";
import { CosmosStakingSdk } from "./staking";
import { CosmosTransactionsSdk } from "./transactions";
import { CosmosChain, cosmosChains } from "../../chains";
import { MultisigKey } from "../../data-structures";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AbstractSdk } from "../abstract";
import { Coin, FormattedCoin } from "../common";

function notImplemented(message: string) {
  warning(false, message);
}

export class CosmosSdk extends AbstractSdk {
  public bank: CosmosBankSdk;
  public contracts: CosmosContractsSdk;
  public gatekeeper: CosmosGatekeeperSdk;
  public staking: CosmosStakingSdk;
  public transactions: CosmosTransactionsSdk;

  protected client: CosmosClient;

  protected constructor(protected chainId: CosmosChain) {
    super(chainId);
    this.client = new CosmosClient(chainId);
    this.bank = new CosmosBankSdk({
      chainId,
      client: this.client,
    });
    this.contracts = new CosmosContractsSdk({
      chainId,
      client: this.client,
    });
    this.gatekeeper = new CosmosGatekeeperSdk({
      chainId,
      client: this.client,
    });
    this.staking = new CosmosStakingSdk({
      chainId,
      client: this.client,
    });
    this.transactions = new CosmosTransactionsSdk({
      chainId,
      client: this.client,
    });
  }

  public get chain() {
    return cosmosChains[this.chainId];
  }

  public async createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }) {
    return await this.client.withSigningStargateClient(
      OfflineAminoSigner.fromSigner({
        signer,
        prefix: this.chain.prefix,
      }),
      async (client) => {
        const encodeObjects = messages.map((message) => {
          return this.aminoTypes.fromAmino(message.toAmino());
        });
        const gas = await client.simulate(
          this.transactions.getAddressOfPublicKey(signer.publicKey),
          encodeObjects,
          ""
        );
        const transaction = await client.sign(
          this.transactions.getAddressOfPublicKey(signer.publicKey),
          encodeObjects,
          {
            ...this.defaultFee,
            gas: gas.toString(),
          },
          ""
        );
        return TxRaw.encode(transaction).finish();
      }
    );
  }

  public async canExecute(_: {
    address: string;
    proxyAddress: string;
    messages: Message[];
  }) {
    notImplemented("canExecute not implemented for Cosmos");
    return false;
  }

  public async broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }) {
    return await this.client.withStargateClient(async (client) => {
      const rawResult = await client.broadcastTx(signedTransaction);
      return {
        success: isDeliverTxSuccess(rawResult),
        transactionHash: rawResult.transactionHash,
        rawLog: rawResult.rawLog,
        rawResult,
      };
    });
  }

  public async createWallet(_: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }) {
    notImplemented("createWallet not implemented for Cosmos");
    return {
      approved: false as const,
    };
  }

  public formatCoin(coin: Coin): FormattedCoin {
    switch (coin.denom) {
      case this.chain.denom: {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: null,
          denom: this.chain.denom.slice(1).toUpperCase(),
          digits,
          label: this.chain.denom[1].toUpperCase() + this.chain.denom.slice(2),
          amount,
        };
      }
      case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034": {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: null,
          denom: "axlUSDC",
          digits,
          label: "USDC (Axelar)",
          amount,
        };
      }
      case "uloop": {
        const digits = 6;
        const amount = parseInt(coin.amount, 10) / Math.pow(10, digits);
        return {
          icon: null,
          denom: "LOOP",
          digits,
          label: "Loop",
          amount,
        };
      }
      default:
        return super.formatCoin(coin);
    }
  }

  protected get defaultFee(): StdFee {
    return {
      amount: coins(6000, this.chain.denom),
      gas: "1280000",
    };
  }

  protected get aminoTypes() {
    return new AminoTypes({
      ...createAuthzAminoConverters(),
      ...createBankAminoConverters(),
      ...createDistributionAminoConverters(),
      ...createGovAminoConverters(),
      ...createStakingAminoConverters(),
      ...createIbcAminoConverters(),
      ...createFeegrantAminoConverters(),
      ...createVestingAminoConverters(),
      ...createWasmAminoConverters(),
    });
  }

  public static chainId(chainId: CosmosChain) {
    return new CosmosSdk(chainId);
  }
}
