import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";

import { HomeChainId } from "../../home-chains";
import { GatekeeperContractAddresses, PermissionedAddress } from "../common";

export abstract class AbstractGatekeeperSdk {
  protected queryNamespace: QueryClientNamespace<
    "gatekeeper-sdk",
    { chainId: HomeChainId }
  >;

  protected constructor(protected chainId: HomeChainId) {
    this.queryNamespace = new QueryClientNamespace("gatekeeper-sdk", {
      chainId,
    });
  }

  /**
   * Fetches the gatekeeper contractAddresses of the given Obi smart account.
   *
   * @param proxyAddress - The address of the Obi smart account.
   * @see {@link contractAddressesQuery} for usage with TanStack Query.
   */
  public contractAddresses(proxyAddress: string) {
    return queryClient.fetchQuery(this.contractAddressesQuery(proxyAddress));
  }

  public get contractAddressesQuery() {
    return this.queryNamespace.createQuery({
      name: "contractAddresses",
      fn: this.contractAddressesQueryFn.bind(this),
    });
  }

  protected abstract contractAddressesQueryFn(
    proxyAddress: string,
  ): Promise<GatekeeperContractAddresses>;

  /**
   * Fetches the permissioned addresses (i.e. beneficiaries anf flex accounts) of the given Obi smart account.
   *
   * @param proxyAddress - The address of the Obi smart account.
   * @see {@link permissionedAddressesQuery} for usage with TanStack Query.
   */
  public permissionedAddresses(proxyAddress: string) {
    return queryClient.fetchQuery(
      this.permissionedAddressesQuery(proxyAddress),
    );
  }

  public get permissionedAddressesQuery() {
    return this.queryNamespace.createQuery({
      name: "permissionedAddresses",
      fn: this.permissionedAddressesQueryFn.bind(this),
    });
  }

  protected abstract permissionedAddressesQueryFn(
    proxyAddress: string,
  ): Promise<PermissionedAddress[]>;
}
