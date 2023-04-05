import { pubkeyToAddress, StdFee } from "@cosmjs/amino";
import {
  CosmWasmClient,
  createWasmAminoConverters,
  JsonObject,
} from "@cosmjs/cosmwasm-stargate";
import { coins, OfflineSigner } from "@cosmjs/proto-signing";
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
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { createVestingAminoConverters } from "@cosmjs/stargate/build/modules";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { AuthInfo, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import * as R from "ramda";
import invariant from "tiny-invariant";
import warning from "tiny-warning";

import { MultisigSigner } from "./multisig-signer";
import { OfflineAminoSigner } from "./offline-amino-signer";
import { CosmosChain, cosmosChains } from "../../chains";
import {
  withCosmosClients,
  withCosmosCosmWasmClient,
  withCosmosSigningStargateClient,
  withCosmosStargateClient,
} from "../../clients";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { MultisigPublicKey, PublicKey } from "../../keys";
import { Signer } from "../../signers";
import { Message, SignedTransaction } from "../../transactions";
import { AbstractSdk } from "../abstract";
import {
  AccountValidationResult,
  BroadcastTransactionResult,
  CodeIds,
  Coin,
  FormattedCoin,
} from "../common";

function notImplemented(message: string) {
  warning(false, message);
}

export class CosmosSdk extends AbstractSdk {
  protected constructor(protected chainId: CosmosChain) {
    super(chainId);
  }

  public get chain() {
    return cosmosChains[this.chainId];
  }

  public validateAddress({ address }: { address: string }) {
    try {
      Bech32Address.validate(address, this.chain.prefix);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async validateAccount({ address }: { address: string }) {
    if (!this.validateAddress({ address })) {
      return AccountValidationResult.INVALID_ADDRESS;
    }
    const account = await this.fetchAccount({ address });
    if (!account) {
      return AccountValidationResult.ACCOUNT_NOT_READY;
    }
    if (!account.pubkey) {
      return AccountValidationResult.PUBLIC_KEY_NOT_READY;
    }
    return AccountValidationResult.READY;
  }

  public async prepareSigner({ signer }: { signer: Signer }) {
    const address = this.getAddressOfSigner({ signer });
    await this.prepareAccount({ address });
    const validationResult = await this.validateAccount({ address });
    invariant(
      validationResult >= AccountValidationResult.PUBLIC_KEY_NOT_READY,
      "Account not ready"
    );
    if (validationResult <= AccountValidationResult.PUBLIC_KEY_NOT_READY) {
      await this.withSigningStargateClient(
        OfflineAminoSigner.fromSigner({
          signer,
          prefix: this.chain.prefix,
        }),
        async (client) => {
          await client.sendTokens(
            address,
            address,
            coins(1, this.chain.denom),
            "auto",
            ""
          );
        }
      );
      while (
        (await this.validateAccount({ address })) <=
        AccountValidationResult.PUBLIC_KEY_NOT_READY
      ) {
        await this.wait({ ms: 100 });
      }
    }
  }

  protected async fetchAccount({ address }: { address: string }) {
    return this.withStargateClient(async (client) => {
      return await client.getAccount(address);
    });
  }

  public async fetchPrices() {
    return await this.withCosmWasmClient(async (cosmWasmClient) => {
      const denoms = (() => {
        switch (this.chainId) {
          case "uni-3":
            return ["ujuno"];
          case "juno-1":
            return [
              "ujuno",
              "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
              "uloop",
            ];
        }
      })();

      const getContractRoute = (denom: string) => {
        switch (this.chainId) {
          case "uni-3":
            return [
              "juno1dmwfwqvke4hew5s93ut8h4tgu6sxv67zjw0y3hskgkfpy3utnpvseqyjs7",
            ];
          case "juno-1":
            switch (denom) {
              case "ujuno":
                return [
                  "juno1ctsmp54v79x7ea970zejlyws50cj9pkrmw49x46085fn80znjmpqz2n642",
                ]; // needs to be juno type
              case "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034":
                return []; //axlUSDC
              case "uloop": //LOOP
                return [
                  "",
                  "juno1utkr0ep06rkxgsesq6uryug93daklyd6wneesmtvxjkz0xjlte9qdj2s8q",
                ];
            }
        }
        return null;
      };

      const getUsdRate = async (denom: string) => {
        const route = getContractRoute(denom);

        if (!route) return 0;
        if (route.length === 0) return 10 ** 6;

        let dexBasePriceElements: JsonObject;

        let dexBasePrice: number;
        if (
          route[0] ===
          "juno1ctsmp54v79x7ea970zejlyws50cj9pkrmw49x46085fn80znjmpqz2n642"
        ) {
          dexBasePriceElements = await cosmWasmClient.queryContractSmart(
            route[0],
            {
              token1_for_token2_price: {
                token1_amount: "10000000",
              },
            }
          );
          dexBasePrice = Number(dexBasePriceElements.token2_amount) / 10;
        } else if (route[0] !== "") {
          dexBasePriceElements = await cosmWasmClient.queryContractSmart(
            route[0],
            {
              simulation: {
                offer_asset: {
                  amount: "10000000", // force 10 for now, but may have slippage or other issues with assets
                  info: {
                    native_token: { denom: denom },
                  },
                },
              },
            }
          );
          dexBasePrice =
            (Number(dexBasePriceElements.commissionAmount) +
              Number(dexBasePriceElements.returnAmount)) /
            10;
        } else {
          if (route.length === 0) {
            console.error("No price route found for " + denom);
          }
          dexBasePrice = 1000000;
        }

        if (route.length === 1) {
          // is base asset
          return dexBasePrice;
        }
        try {
          const basePriceInUsdElements =
            await cosmWasmClient.queryContractSmart(route[1], {
              reverse_simulation: {
                ask_asset: {
                  amount: "10000000", //$10
                  info: {
                    native_token: {
                      denom:
                        "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
                    },
                  },
                },
              },
            });
          const basePrice =
            Number(basePriceInUsdElements.commission_amount) +
            Number(basePriceInUsdElements.offer_amount);
          return (dexBasePrice * 10000000) / basePrice;
        } catch (e) {
          console.error("Price query failed");
          return 0;
        }
      };

      return R.fromPairs(
        await Promise.all(
          denoms.map(async (denom) => {
            return [denom, (await getUsdRate(denom)) / 10 ** 6];
          })
        )
      );
    });
  }

  protected async fetchBalance({
    address,
    denom,
  }: {
    address: string;
    denom: string;
  }) {
    return this.withStargateClient(async (client) => {
      return await client.getBalance(address, denom);
    });
  }

  protected async balancesQueryFn(address: string) {
    return await this.withClients(
      async ({ stargateClient, cosmWasmClient }) => {
        const [nativeBalances, customBalances] = await Promise.all([
          fetchNativeBalances(),
          fetchCustomBalances(),
        ]);
        return [...nativeBalances, ...customBalances];

        async function fetchNativeBalances() {
          const coins = await stargateClient.getAllBalances(address);
          return coins.map((coin: Coin) => {
            return {
              denom: coin.denom,
              amount: coin.amount,
              usdPrice: 0,
            };
          });
        }

        async function fetchCustomBalances() {
          const customTokens = [
            {
              contract:
                "juno1qsrercqegvs4ye0yqg93knv73ye5dc3prqwd6jcdcuj8ggp6w0us66deup",
              denom: "uloop",
            },
          ];

          return await Promise.all(
            customTokens.map(async (customToken) => {
              const response = await cosmWasmClient.queryContractSmart(
                customToken.contract,
                {
                  balance: { address: address },
                }
              );
              return {
                denom: customToken.denom,
                amount: response.balance,
                contract: customToken.contract,
              };
            })
          );
        }
      }
    );
  }

  public async fetchDelegations(_: { address: string }) {
    notImplemented("fetchDelegations not implemented for Cosmos");
    return [];
  }

  public async fetchUnbondingDelegations(_: { address: string }) {
    notImplemented("fetchUnbondingDelegations not implemented for Cosmos");
    return [];
  }

  public async fetchValidators() {
    notImplemented("fetchValidators not implemented for Cosmos");
    return [];
  }

  public async fetchRewards(_: { address: string }) {
    notImplemented("fetchRewards not implemented for Cosmos");
    return {
      perDelegator: [],
      total: {
        denom: this.chain.denom,
        amount: "0",
      },
    };
  }

  public async fetchCodeId({ contract }: { contract: string }) {
    return await this.withCosmWasmClient(async (client) => {
      const { codeId } = await client.getContract(contract);
      return codeId;
    });
  }

  public async fetchCodeIds(wallet: MultisigWallet): Promise<CodeIds> {
    return {
      userAccount: await this.fetchCodeId({
        contract: wallet.proxyAddress,
      }),
      spendLimitGatekeeper: null,
      debtGatekeeper: null,
    };
  }

  public async isOutdated(wallet: MultisigWallet) {
    const codeIds = await this.fetchCodeIds(wallet);
    return codeIds.userAccount < this.chain.currentCodeId;
  }

  public async updateWallet(_: MultisigWallet): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateWallet not implemented for Cosmos");
    return { approved: false };
  }

  public async fetchGatekeeperContractAddresses(_: { proxyAddress: string }) {
    notImplemented(
      "fetchGatekeeperContractAddresses not implemented for Cosmos"
    );
    return {
      spendLimitGatekeeper: null,
      sessionKeyGatekeeper: null,
      debtGatekeeper: null,
    };
  }

  public async fetchPermissionedAddresses(_: { spendLimitGatekeeper: string }) {
    notImplemented("fetchPermissionedAddresses not implemented for Cosmos");
    return [];
  }

  public getAddressOfPublicKey({ publicKey }: { publicKey: PublicKey }) {
    return pubkeyToAddress(publicKey, this.chain.prefix);
  }

  public async createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }) {
    return await this.withSigningStargateClient(
      OfflineAminoSigner.fromSigner({
        signer,
        prefix: this.chain.prefix,
      }),
      async (client) => {
        const encodeObjects = messages.map((message) => {
          return this.aminoTypes.fromAmino(message.toAmino());
        });
        const gas = await client.simulate(
          this.getAddressOfSigner({ signer }),
          encodeObjects,
          ""
        );
        const transaction = await client.sign(
          this.getAddressOfSigner({ signer }),
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

  public async createMultisigSigner({
    multisigPublicKey,
    messages,
  }: {
    multisigPublicKey: MultisigPublicKey;
    messages: Message[];
  }) {
    const address = this.getAddressOfPublicKey({
      publicKey: multisigPublicKey,
    });
    await this.prepareAccount({ address });
    const account = await this.fetchAccount({ address });
    invariant(account, "Account not found.");

    const aminoMessages = messages.map((message) => {
      return message.toAmino();
    });
    const encodeObjects = aminoMessages.map((aminoMessage) => {
      return this.aminoTypes.fromAmino(aminoMessage);
    });

    return new MultisigSigner({
      chainId: this.chainId,
      account,
      fee: this.defaultFee,
      encodeObjects,
      messages: aminoMessages,
      multisigPublicKey,
    });
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
    return await this.withStargateClient(async (client) => {
      const rawResult = await client.broadcastTx(signedTransaction);
      return {
        success: isDeliverTxSuccess(rawResult),
        transactionHash: rawResult.transactionHash,
        rawLog: rawResult.rawLog,
        rawResult,
      };
    });
  }

  public async broadcastSignedTransactionAndLendFees({
    signedTransaction,
    sender,
  }: {
    signedTransaction: SignedTransaction;
    sender: string;
  }) {
    const transaction = TxRaw.decode(signedTransaction);
    const { fee } = AuthInfo.decode(transaction.authInfoBytes);

    const hasEnoughForFees = async () => {
      if (!fee) return true;
      invariant(fee.amount.length === 1, "fee.amount.length must be 1");
      const balance = await this.fetchBalance({
        address: sender,
        denom: fee.amount[0].denom,
      });
      return (
        balance &&
        parseInt(balance.amount, 10) >= parseInt(fee.amount[0].amount, 10)
      );
    };

    while (!(await hasEnoughForFees())) {
      await this.lendFees({ address: sender });
    }

    return await this.broadcastSignedTransaction({ signedTransaction });
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

  public getCreateWalletMessage(_: MultisigKey): Message {
    notImplemented("getCreateWalletMessage not implemented for Cosmos");
    throw new Error("getCreateWalletMessage not implemented for Cosmos");
  }

  public async updateOwner(_: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateOwner not implemented for Cosmos");
    return { approved: false };
  }

  public getProposeUpdateOwnerMessage(_: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message {
    notImplemented("getProposeUpdateOwnerMessage not implemented for Cosmos");
    throw new Error("getProposeUpdateOwnerMessage not implemented for Cosmos");
  }

  public getConfirmUpdateOwnerMessage(_: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message {
    notImplemented("getConfirmUpdateOwnerMessage not implemented for Cosmos");
    throw new Error("getConfirmUpdateOwnerMessage not implemented for Cosmos");
  }

  public getUpdateWalletMessage(_: {
    wallet: MultisigWallet;
    codeIds: CodeIds;
  }): Message {
    notImplemented("getUpdateWalletMessage not implemented for Cosmos");
    throw new Error("getUpdateWalletMessage not implemented for Cosmos");
  }

  public async stake(_: {
    wallet: MultisigWallet;
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
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("unstake not implemented for Cosmos");
    return { approved: false };
  }

  public async withdrawRewards(
    _: MultisigWallet
  ): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    notImplemented("withdrawRewards not implemented for Cosmos");
    return { approved: false };
  }

  public getStakeMessage(_: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message {
    notImplemented("getStakeMessage not implemented for Cosmos");
    throw new Error("getStakeMessage not implemented for Cosmos");
  }

  public getUnstakeMessage(_: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message {
    notImplemented("getUnstakeMessage not implemented for Cosmos");
    throw new Error("getUnstakeMessage not implemented for Cosmos");
  }

  public getWithdrawRewardsMessage(_: {
    wallet: MultisigWallet;
    validator: string;
  }): Message {
    notImplemented("getWithdrawRewardsMessage not implemented for Cosmos");
    throw new Error("getWithdrawRewardsMessage not implemented for Cosmos");
  }

  public async updateGatekeeperConfig(_: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
  }): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    notImplemented("updateGatekeeperConfig not implemented for Cosmos");
    return { approved: false };
  }

  public getUpdateGatekeeperMessages(_: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
    spendLimitGatekeeper: string;
    sessionKeyGatekeeper: string;
  }) {
    notImplemented("getUpdateGatekeeperMessages not implemented for Cosmos");
    return [];
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

  public withCosmWasmClient<T>(f: (client: CosmWasmClient) => T) {
    return withCosmosCosmWasmClient(this.chainId, f);
  }

  public withStargateClient<T>(f: (client: StargateClient) => T) {
    return withCosmosStargateClient(this.chainId, f);
  }

  public withSigningStargateClient<T>(
    signer: OfflineSigner,
    f: (client: SigningStargateClient) => T
  ) {
    return withCosmosSigningStargateClient(
      { chainId: this.chainId, signer },
      f
    );
  }

  public withClients<T>(
    f: (clients: {
      stargateClient: StargateClient;
      cosmWasmClient: CosmWasmClient;
    }) => T
  ) {
    return withCosmosClients(this.chainId, f);
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
