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

export abstract class AbstractSdk {
  protected constructor(protected chainId: Chain) {}

  public abstract validateAddress({ address }: { address: string }): boolean;
  public abstract validateAccount({
    address,
  }: {
    address: string;
  }): Promise<AccountValidationResult>;

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
}
