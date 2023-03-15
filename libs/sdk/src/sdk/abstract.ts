import fetch from "isomorphic-unfetch";
import invariant from "tiny-invariant";

import {
  AccountValidationResult,
  Coin,
  Delegation,
  EnrichedValidator,
  GatekeeperContractAddresses,
  PermissionedAddress,
  Rewards,
  UnbondingDelegation,
} from "./common";
import { Chain } from "../chains";
import { AbstractSigner } from "../signers";

export abstract class AbstractSdk {
  protected constructor(protected chainId: Chain) {}

  public abstract validateAddress({ address }: { address: string }): boolean;
  public abstract validateAccount({
    address,
  }: {
    address: string;
  }): Promise<AccountValidationResult>;
  public async prepareAccount({ address }: { address: string }): Promise<void> {
    const validationResult = await this.validateAccount({ address });
    invariant(
      validationResult !== AccountValidationResult.INVALID_ADDRESS,
      "Invalid address"
    );

    if (validationResult <= AccountValidationResult.ACCOUNT_NOT_READY) {
      await this.lendFees({ address });
      while (
        (await this.validateAccount({ address })) <=
        AccountValidationResult.ACCOUNT_NOT_READY
      ) {
        await this.wait({ ms: 100 });
      }
    }
  }
  public abstract prepareSigner({
    signer,
  }: {
    signer: AbstractSigner;
  }): Promise<void>;

  public abstract fetchPrices(): Promise<Record<string, number>>;
  public abstract fetchBalances({
    address,
  }: {
    address: string;
  }): Promise<Coin[]>;

  public abstract fetchDelegations({
    address,
  }: {
    address: string;
  }): Promise<Delegation[]>;
  public abstract fetchUnbondingDelegations({
    address,
  }: {
    address: string;
  }): Promise<UnbondingDelegation[]>;
  public abstract fetchValidators(): Promise<EnrichedValidator[]>;
  public abstract fetchRewards({
    address,
  }: {
    address: string;
  }): Promise<Rewards>;

  public abstract fetchCodeId({
    contract,
  }: {
    contract: string;
  }): Promise<number>;

  public abstract fetchGatekeeperContractAddresses({
    proxyAddress,
  }: {
    proxyAddress: string;
  }): Promise<GatekeeperContractAddresses>;
  public abstract fetchPermissionedAddresses({
    spendLimitGatekeeper,
  }: {
    spendLimitGatekeeper: string;
  }): Promise<PermissionedAddress[]>;

  protected async lendFees({ address }: { address: string }) {
    invariant(this.validateAddress({ address }), "Invalid address");
    const response = await fetch(
      "https://fee-lender-worker.obiwallet.workers.dev/",
      {
        method: "POST",
        body: `${this.chainId},${address}`,
      }
    );
    if (response.status !== 200) {
      console.log(response);
      throw new Error("Lending fees failed");
    }
  }

  protected wait({ ms }: { ms: number }): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
