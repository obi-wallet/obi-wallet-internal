import {
  AccAddress,
  Coin as TerraCoin,
  Coins,
  isTxError,
  LegacyAminoMultisigPublicKey,
  MsgDelegate,
  MsgExecuteContract,
  MsgSend,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
  SimplePublicKey,
  Tx,
} from "@terra-money/feather.js";
import { AxiosError } from "axios";
import { Duration } from "luxon";
import * as R from "ramda";
import invariant from "tiny-invariant";
import { z } from "zod";

import { TerraBankSdk } from "./bank";
import { TerraClient } from "./client";
import { TerraGatekeeperSdk } from "./gatekeeper";
import { Key } from "./key";
import { MultisigSigner } from "./multisig-signer";
import { TerraStakingSdk } from "./staking";
import { tokens } from "./tokens";
import { TerraChain, terraChains } from "../../chains";
import {
  GatekeeperConfig,
  MultisigKey,
  MultisigWallet,
} from "../../data-structures";
import { MultisigPublicKey, PublicKey } from "../../keys";
import { Signer } from "../../signers";
import { Message, SignedTransaction, wrapMessage } from "../../transactions";
import { SignAndBroadcastTransactionUserInteraction } from "../../user-interactions";
import { AbstractUserInteractionResponse } from "../../user-interactions/abstract";
import { AbstractSdk } from "../abstract";
import {
  AccountValidationResult,
  BroadcastTransactionResult,
  CodeIds,
  Coin,
  FormattedCoin,
  GatekeeperContractAddresses,
  PermissionedAddress,
  RpcError,
} from "../common";

export class TerraSdk extends AbstractSdk {
  public bank: TerraBankSdk;
  public gatekeeper: TerraGatekeeperSdk;
  public staking: TerraStakingSdk;

  protected client: TerraClient;

  protected constructor(protected chainId: TerraChain) {
    super(chainId);
    this.client = new TerraClient(chainId);
    this.bank = new TerraBankSdk({
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
  }

  public get chain() {
    return terraChains[this.chainId];
  }

  public validateAddress({ address }: { address: string }) {
    return AccAddress.validate(address, this.chain.prefix);
  }

  public async validateAccount({ address }: { address: string }) {
    if (!this.validateAddress({ address })) {
      return AccountValidationResult.INVALID_ADDRESS;
    }
    const account = await this.fetchAccount({ address });
    if (!account) {
      return AccountValidationResult.ACCOUNT_NOT_READY;
    }
    if (!account.getPublicKey()) {
      return AccountValidationResult.PUBLIC_KEY_NOT_READY;
    }
    return AccountValidationResult.READY;
  }

  public async prepareSigner({ signer }: { signer: Signer }) {
    const key = Key.fromSigner(signer);
    const address = key.accAddress(this.chain.prefix);

    await this.prepareAccount({ address });

    const validationResult = await this.validateAccount({ address });
    invariant(
      validationResult >= AccountValidationResult.PUBLIC_KEY_NOT_READY,
      "Account not ready"
    );
    if (validationResult <= AccountValidationResult.PUBLIC_KEY_NOT_READY) {
      await this.client.withClient(async (client) => {
        const wallet = client.wallet(key);
        const { denom } = this.chain;
        const send = new MsgSend(address, address, { [denom]: 1 });
        const tx = await wallet.createAndSignTx({
          chainID: this.chainId,
          msgs: [send],
        });
        await client.tx.broadcastBlock(tx, this.chainId);
      });
      while (
        (await this.validateAccount({ address })) <=
        AccountValidationResult.PUBLIC_KEY_NOT_READY
      ) {
        await this.wait({ ms: 100 });
      }
    }
  }

  protected async fetchAccount({ address }: { address: string }) {
    try {
      return await this.client.withClient(async (client) => {
        return await client.auth.accountInfo(address);
      });
    } catch (e) {
      const error = e as AxiosError;
      const data = error.response?.data;

      const result = RpcError.safeParse(data);
      if (result.success && result.data.message.includes("code = NotFound")) {
        return null;
      }

      throw e;
    }
  }

  public async fetchRewards({ address }: { address: string }) {
    return await this.client.withClient(async (client) => {
      const rewards = await client.distribution.rewards(address);

      const handleRewards = (coins: Coins) => {
        const mapped = coins.map((coin) => {
          return {
            denom: coin.denom,
            amount: coin.amount.toString(),
          };
        });
        return mapped.length > 0
          ? mapped[0]
          : {
              denom: this.chain.denom,
              amount: "0",
            };
      };

      const perDelegator = R.values(
        R.mapObjIndexed((rewards, address) => {
          return {
            address,
            rewards: handleRewards(rewards),
          };
        }, rewards.rewards)
      );
      const total = handleRewards(rewards.total);

      return {
        perDelegator,
        total,
      };
    });
  }

  public async fetchCodeId({ contract }: { contract: string }) {
    return await this.client.withClient(async (client) => {
      const { code_id } = await client.wasm.contractInfo(contract);
      return code_id;
    });
  }

  public async fetchCodeIds(wallet: MultisigWallet) {
    const addresses = {
      userAccount: wallet.proxyAddress,
      ...(await this.gatekeeper.fetchContractAddresses(wallet.proxyAddress)),
    };

    const pairs = R.toPairs(addresses);
    const pairsWithCodeIds = await Promise.all(
      pairs.map(async ([key, address]) => {
        return [
          key,
          address ? await this.fetchCodeId({ contract: address }) : null,
        ] as [string, number | null];
      })
    );
    return R.fromPairs(pairsWithCodeIds) as unknown as CodeIds;
  }

  public async isOutdated(wallet: MultisigWallet) {
    const codeIds = await this.fetchCodeIds(wallet);
    return this.isOutdatedGivenCodeIds(codeIds);
  }

  protected isOutdatedGivenCodeIds(codeIds: CodeIds) {
    return (
      codeIds.userAccount < this.chain.currentCodeIds.userAccount ||
      codeIds.spendLimitGatekeeper === null ||
      codeIds.spendLimitGatekeeper <
        this.chain.currentCodeIds.spendLimitGatekeeper ||
      codeIds.debtGatekeeper === null ||
      codeIds.debtGatekeeper < this.chain.currentCodeIds.debtGatekeeper
    );
  }

  public async updateWallet(wallet: MultisigWallet): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const codeIds = await this.fetchCodeIds(wallet);
    if (!this.isOutdatedGivenCodeIds(codeIds)) {
      return {
        approved: true,
        payload: {
          success: true,
        },
      };
    }

    return await SignAndBroadcastTransactionUserInteraction.start({
      messages: [this.getUpdateWalletMessage({ wallet, codeIds })],
      demoMode: wallet.isDemo,
      cancelable: true,
      multisigKey: wallet.owner,
    });
  }

  public async fetchGatekeeperContractAddresses({
    proxyAddress,
  }: {
    proxyAddress: string;
  }) {
    return await this.client.withClient(async (client) => {
      const schema = z
        .object({
          spendlimit_gatekeeper_contract_addr: z.string().nullable(),
          sessionkey_gatekeeper_contract_addr: z.string().nullable(),
          debt_gatekeeper_contract_addr: z.string().nullable(),
        })
        .transform((response): GatekeeperContractAddresses => {
          return {
            spendLimitGatekeeper: response.spendlimit_gatekeeper_contract_addr,
            sessionKeyGatekeeper: response.sessionkey_gatekeeper_contract_addr,
            debtGatekeeper: response.debt_gatekeeper_contract_addr,
          };
        });
      const response = await client.wasm.contractQuery(proxyAddress, {
        gatekeeper_contracts: {},
      });
      return schema.parse(response);
    });
  }

  public async fetchPermissionedAddresses({
    spendLimitGatekeeper,
  }: {
    spendLimitGatekeeper: string;
  }) {
    return await this.client.withClient(async (client) => {
      const schema = z.object({
        permissioned_addresses: z.array(PermissionedAddress),
      });
      const response = await client.wasm.contractQuery(spendLimitGatekeeper, {
        permissioned_addresses: {},
      });
      return schema.parse(response).permissioned_addresses;
    });
  }

  public getAddressOfPublicKey({ publicKey }: { publicKey: PublicKey }) {
    switch (publicKey.type) {
      case "tendermint/PubKeySecp256k1":
        return SimplePublicKey.fromAmino(publicKey).address(this.chain.prefix);
      case "tendermint/PubKeyMultisigThreshold":
        return LegacyAminoMultisigPublicKey.fromAmino(publicKey).address(
          this.chain.prefix
        );
      default:
        throw new Error("Unsupported public key type");
    }
  }

  public async createAndSignTransaction({
    signer,
    messages,
  }: {
    signer: Signer;
    messages: Message[];
  }) {
    return await this.client.withClient(async (client) => {
      const key = Key.fromSigner(signer);
      const wallet = client.wallet(key);
      try {
        const transaction = await wallet.createAndSignTx({
          chainID: this.chainId,
          msgs: messages,
        });
        return transaction.toBytes();
      } catch (e) {
        const error = e as AxiosError;
        const data = error.response?.data;

        const result = RpcError.safeParse(data);
        if (result.success) {
          throw new Error(result.data.message);
        }

        throw e;
      }
    });
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

    try {
      return await this.client.withClient(async (client) => {
        const transaction = await client.tx.create(
          [
            {
              address,
              sequenceNumber: account.getSequenceNumber(),
              publicKey: account.getPublicKey(),
            },
          ],
          {
            chainID: this.chainId,
            msgs: messages,
          }
        );
        return new MultisigSigner({
          chainId: this.chainId,
          account,
          transaction,
          multisigPublicKey,
        });
      });
    } catch (e) {
      const error = e as AxiosError;
      const data = error.response?.data;

      const result = RpcError.safeParse(data);
      if (result.success) {
        throw new Error(result.data.message);
      }

      throw e;
    }
  }

  public async canExecute({
    address,
    proxyAddress,
    messages,
  }: {
    address: string;
    proxyAddress: string;
    messages: Message[];
  }) {
    return await this.client.withClient(async (client) => {
      const mayExecute = await Promise.all(
        messages.map(async (message) => {
          try {
            const response = await client.wasm.contractQuery<{
              can_execute: { yes?: string };
            }>(proxyAddress, {
              can_execute: {
                funds: [],
                address,
                msg: { legacy: wrapMessage(message) },
              },
            });
            return !!response.can_execute.yes;
          } catch (e) {
            console.log(e);
            return false;
          }
        })
      );
      return mayExecute.every((mayExecute) => mayExecute);
    });
  }

  public async broadcastSignedTransaction({
    signedTransaction,
  }: {
    signedTransaction: SignedTransaction;
  }) {
    return await this.client.withClient(async (client) => {
      const transaction = Tx.fromBuffer(Buffer.from(signedTransaction));
      const rawResult = await client.tx.broadcastBlock(
        transaction,
        this.chainId
      );
      return {
        success: !isTxError(rawResult),
        transactionHash: rawResult.txhash,
        rawLog: rawResult.raw_log,
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
    const response = await this.broadcastSignedTransaction({
      signedTransaction,
    });
    if (response.success || !response.rawLog.includes("insufficient funds")) {
      return response;
    }
    await this.lendFees({ address: sender });
    return await this.broadcastSignedTransaction({ signedTransaction });
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
      messages: [this.getCreateWalletMessage(multisigKey)],
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

  protected getSigners(multisigKey: MultisigKey) {
    const addresses = multisigKey.keys.map((key) => {
      return this.getAddressOfPublicKey({ publicKey: key.publicKey });
    });
    return R.zipWith(
      (address, ty) => {
        return { address, ty };
      },
      addresses,
      multisigKey.signerTypes
    );
  }

  public getCreateWalletMessage(multisigKey: MultisigKey): Message {
    const rawMessage = {
      new_account: {
        fee_debt: parseInt(this.chain.startingUsdDebt, 10),
        gatekeeper_authorizations: {
          beneficiary_auths: [],
          message_auths: [],
          session_keys: [],
          spendlimit_auths: [],
        },
        owner: multisigKey.address,
        signers: {
          signers: this.getSigners(multisigKey),
        },
        update_delay: 0,
      },
    };

    return new MsgExecuteContract(
      multisigKey.address,
      this.chain.accountCreatorAddress,
      rawMessage
    );
  }

  public async updateOwner({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const codeIds = await this.fetchCodeIds(wallet);
    const response = await this.proposeUpdateOwner({
      wallet,
      newOwner,
      codeIds,
    });

    if (!response.approved || !response.payload.success) {
      return response;
    }

    return await this.confirmUpdateOwner({
      wallet,
      newOwner,
    });
  }

  protected async proposeUpdateOwner({
    wallet,
    newOwner,
    codeIds,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const message = this.getProposeUpdateOwnerMessage({
      wallet,
      newOwner,
      codeIds,
    });
    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      demoMode: wallet.isDemo,
      cancelable: true,
      multisigKey: wallet.owner,
    });

    if (!response.approved) {
      return { approved: false };
    }

    if (response.approved && !response.payload.success) {
      console.error(response.payload.rawLog);
      return await this.proposeUpdateOwner({ wallet, newOwner, codeIds });
    }

    return response;
  }

  protected async confirmUpdateOwner({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const message = this.getConfirmUpdateOwnerMessage({
      wallet,
      newOwner,
    });
    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      demoMode: wallet.isDemo,
      cancelable: true,
      multisigKey: newOwner,
    });

    if (!response.approved) {
      return { approved: false };
    }

    if (response.approved && !response.payload.success) {
      console.error(response.payload.rawLog);
      return await this.confirmUpdateOwner({ wallet, newOwner });
    }

    return response;
  }

  public getProposeUpdateOwnerMessage({
    wallet,
    newOwner,
    codeIds,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
    codeIds: CodeIds;
  }): Message {
    const rawMessage = {
      propose_update_owner: {
        new_owner: newOwner.address,
        ...(codeIds.userAccount >= 1081
          ? {
              signers: {
                signers: this.getSigners(newOwner),
              },
            }
          : {}),
      },
    };
    return new MsgExecuteContract(
      wallet.owner.address,
      wallet.proxyAddress,
      rawMessage
    );
  }

  public getConfirmUpdateOwnerMessage({
    wallet,
    newOwner,
  }: {
    wallet: MultisigWallet;
    newOwner: MultisigKey;
  }): Message {
    const rawMessage = {
      confirm_update_owner: {},
    };
    return new MsgExecuteContract(
      newOwner.address,
      wallet.proxyAddress,
      rawMessage
    );
  }

  public async updateGatekeeperConfig({
    wallet,
    newGatekeeperConfig,
  }: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
  }): Promise<
    | {
        approved: true;
        payload: BroadcastTransactionResult | { success: true };
      }
    | { approved: false }
  > {
    const { spendLimitGatekeeper, sessionKeyGatekeeper } =
      await this.gatekeeper.fetchContractAddresses(wallet.proxyAddress);
    invariant(
      spendLimitGatekeeper,
      "Spend limit gatekeeper address is not set"
    );
    invariant(
      sessionKeyGatekeeper,
      "Session key gatekeeper address is not set"
    );
    const messages = this.getUpdateGatekeeperMessages({
      wallet,
      newGatekeeperConfig,
      spendLimitGatekeeper,
      sessionKeyGatekeeper,
    });

    return await SignAndBroadcastTransactionUserInteraction.start({
      messages,
      demoMode: wallet.isDemo,
      cancelable: true,
      multisigKey: wallet.owner,
    });
  }

  public getUpdateGatekeeperMessages({
    wallet,
    newGatekeeperConfig,
    spendLimitGatekeeper,
    sessionKeyGatekeeper,
  }: {
    wallet: MultisigWallet;
    newGatekeeperConfig: GatekeeperConfig;
    spendLimitGatekeeper: string;
    sessionKeyGatekeeper: string;
  }): Message[] {
    function handleBeneficiaries() {
      const messages: MsgExecuteContract[] = [];

      const previousBeneficiaryAddresses =
        wallet.gatekeeperConfig.beneficiaries.map((beneficiary) => {
          return beneficiary.address;
        });
      const nextBeneficiaryAddresses = newGatekeeperConfig.beneficiaries.map(
        (beneficiary) => {
          return beneficiary.address;
        }
      );

      const removedAddresses = R.difference(
        previousBeneficiaryAddresses,
        nextBeneficiaryAddresses
      );

      newGatekeeperConfig.beneficiaries.forEach((beneficiary) => {
        const previousBeneficiary = wallet.gatekeeperConfig.beneficiaries.find(
          (previousBeneficiary) => {
            return previousBeneficiary.address === beneficiary.address;
          }
        );

        if (previousBeneficiary && beneficiary.equals(previousBeneficiary)) {
          return;
        }

        const periodProperties = (() => {
          const { period } = beneficiary.dripSchedule;

          if (R.has("days", period)) {
            return {
              period_multiple: period.days,
              period_type: "days",
            };
          } else if (R.has("months", period)) {
            return {
              period_multiple: period.months,
              period_type: "months",
            };
          } else {
            return {
              period_multiple: period.years * 12,
              period_type: "months",
            };
          }
        })();

        const rawMessage = {
          upsert_beneficiary: {
            new_beneficiary: {
              address: beneficiary.address,
              cooldown: Duration.fromObject(beneficiary.dormancyThreshold).as(
                "days"
              ),
              inheritance_records: [],
              offset: 0,
              ...periodProperties,
              spend_limits: [
                {
                  amount: `${Math.floor(beneficiary.dripSchedule.rate * 100)}`,
                  current_balance: "0",
                  limit_remaining: "0",
                  denom: "PERCENT",
                },
              ],
            },
          },
        };

        messages.push(
          new MsgExecuteContract(
            wallet.owner.address,
            spendLimitGatekeeper,
            rawMessage
          )
        );
      });

      removedAddresses.forEach((address) => {
        const rawMessage = {
          rm_permissioned_address: {
            doomed_permissioned_address: address,
          },
        };
        messages.push(
          new MsgExecuteContract(
            wallet.owner.address,
            spendLimitGatekeeper,
            rawMessage
          )
        );
      });

      return messages;
    }

    function handleFlexAccounts() {
      const messages: MsgExecuteContract[] = [];

      const previousFlexAccountAddresses =
        wallet.gatekeeperConfig.flexAccounts.map((flexAccount) => {
          return flexAccount.address;
        });
      const nextFlexAccountAddresses = newGatekeeperConfig.flexAccounts.map(
        (flexAccount) => {
          return flexAccount.address;
        }
      );

      const removedAddresses = R.difference(
        previousFlexAccountAddresses,
        nextFlexAccountAddresses
      );

      newGatekeeperConfig.flexAccounts.forEach((flexAccount) => {
        const previousFlexAccount = wallet.gatekeeperConfig.flexAccounts.find(
          (previousFlexAccount) => {
            return previousFlexAccount.address === flexAccount.address;
          }
        );

        if (
          !previousFlexAccount ||
          !R.equals(
            flexAccount.remainingAutoSignDuration,
            previousFlexAccount.remainingAutoSignDuration
          )
        ) {
          if (flexAccount.autoSignEndTime) {
            const rawMessage = {
              create_session_key: {
                address: flexAccount.address,
                admin_permissions: true,
                max_duration: flexAccount.autoSignEndTime.toUnixInteger(),
                use_limit: 999,
              },
            };

            messages.push(
              new MsgExecuteContract(
                wallet.owner.address,
                sessionKeyGatekeeper,
                rawMessage
              )
            );
          } else if (
            previousFlexAccount?.hasActiveAutoSign &&
            !flexAccount.hasActiveAutoSign
          ) {
            const rawMessage = {
              destroy_session_key: {
                address: flexAccount.address,
              },
            };

            messages.push(
              new MsgExecuteContract(
                wallet.owner.address,
                sessionKeyGatekeeper,
                rawMessage
              )
            );
          }
        }

        if (previousFlexAccount && flexAccount.equals(previousFlexAccount)) {
          return;
        }

        const additionalProperties = (() => {
          if (flexAccount.spendLimit) {
            const { period } = flexAccount.spendLimit;

            const periodProperties = (() => {
              if (R.has("days", period)) {
                return {
                  period_multiple: period.days,
                  period_type: "days",
                };
              } else if (R.has("months", period)) {
                return {
                  period_multiple: period.months,
                  period_type: "months",
                };
              } else {
                return {
                  period_multiple: period.years * 12,
                  period_type: "months",
                };
              }
            })();

            const amount = `${1_000_000 * flexAccount.spendLimit.amount}`;

            return {
              ...periodProperties,
              spend_limits: [
                {
                  amount,
                  current_balance: "0",
                  denom:
                    "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
                  limit_remaining: amount,
                },
              ],
            };
          } else {
            return {
              period_multiple: 0,
              period_type: "days",
              spend_limits: [],
            };
          }
        })();

        const rawMessage = {
          upsert_permissioned_address: {
            new_permissioned_address: {
              address: flexAccount.address,
              cooldown: 0,
              inheritance_records: [],
              offset: 0,
              ...additionalProperties,
            },
          },
        };
        messages.push(
          new MsgExecuteContract(
            wallet.owner.address,
            spendLimitGatekeeper,
            rawMessage
          )
        );
      });

      removedAddresses.forEach((address) => {
        const rawMessage = {
          rm_permissioned_address: {
            doomed_permissioned_address: address,
          },
        };
        messages.push(
          new MsgExecuteContract(
            wallet.owner.address,
            spendLimitGatekeeper,
            rawMessage
          )
        );
      });

      return messages;
    }

    return [...handleBeneficiaries(), ...handleFlexAccounts()];
  }

  public getUpdateWalletMessage({
    wallet,
    codeIds,
  }: {
    wallet: MultisigWallet;
    codeIds: CodeIds;
  }): Message {
    return new MsgExecuteContract(wallet.owner.address, wallet.proxyAddress, {
      wrapped_migrate: {
        ...(codeIds.userAccount < this.chain.currentCodeIds.userAccount
          ? {
              code_id:
                codeIds.userAccount <= 1014
                  ? 1081
                  : this.chain.currentCodeIds.userAccount,
              ...(codeIds.userAccount >= 1081
                ? {
                    signers: {
                      signers: this.getSigners(wallet.owner),
                    },
                  }
                : {}),
            }
          : {}),
        ...(codeIds.userAccount >= 1261
          ? {
              gatekeeper_code_ids: {
                ...(!codeIds.spendLimitGatekeeper ||
                codeIds.spendLimitGatekeeper <
                  this.chain.currentCodeIds.spendLimitGatekeeper
                  ? {
                      spendlimit:
                        this.chain.currentCodeIds.spendLimitGatekeeper,
                    }
                  : {}),
                ...(!codeIds.debtGatekeeper ||
                codeIds.debtGatekeeper <
                  this.chain.currentCodeIds.debtGatekeeper
                  ? {
                      debt: this.chain.currentCodeIds.debtGatekeeper,
                    }
                  : {}),
              },
            }
          : {}),
      },
    });
  }

  public async stake({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    return await SignAndBroadcastTransactionUserInteraction.start({
      messages: [
        this.getStakeMessage({
          wallet,
          amount,
          validator,
        }),
      ],
      demoMode: wallet.isDemo,
      cancelable: true,
      walletMeta: wallet.meta,
    });
  }

  public getStakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message {
    return new MsgDelegate(
      wallet.address,
      validator,
      new TerraCoin(amount.denom, amount.amount)
    );
  }

  public async unstake({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    return await SignAndBroadcastTransactionUserInteraction.start({
      messages: [
        this.getUnstakeMessage({
          wallet,
          amount,
          validator,
        }),
      ],
      demoMode: wallet.isDemo,
      cancelable: true,
      walletMeta: wallet.meta,
    });
  }

  public getUnstakeMessage({
    wallet,
    amount,
    validator,
  }: {
    wallet: MultisigWallet;
    amount: Coin;
    validator: string;
  }): Message {
    return new MsgUndelegate(
      wallet.address,
      validator,
      new TerraCoin(amount.denom, amount.amount)
    );
  }

  public async withdrawRewards(
    wallet: MultisigWallet
  ): Promise<
    | { approved: true; payload: BroadcastTransactionResult }
    | { approved: false }
  > {
    const rewards = await this.staking.fetchRewards(wallet.address);
    const validators = rewards.perDelegator
      .filter((delegator) => {
        return this.formatCoin(delegator.rewards).amount > 0;
      })
      .map((delegator) => {
        return delegator.address;
      });
    const messages = validators.map((validator) => {
      return this.getWithdrawRewardsMessage({
        wallet,
        validator,
      });
    });
    return await SignAndBroadcastTransactionUserInteraction.start({
      messages,
      demoMode: wallet.isDemo,
      cancelable: true,
      walletMeta: wallet.meta,
    });
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

  public getWithdrawRewardsMessage({
    wallet,
    validator,
  }: {
    wallet: MultisigWallet;
    validator: string;
  }): Message {
    return new MsgWithdrawDelegatorReward(wallet.address, validator);
  }

  public static chainId(chainId: TerraChain) {
    return new TerraSdk(chainId);
  }
}
