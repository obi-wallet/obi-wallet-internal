import warning from "tiny-warning";

import { CosmosClient } from "./client";
import { CosmosChain } from "../../chains";
import { AbstractGatekeeperSdk } from "../abstract";
import { GatekeeperContractAddresses, PermissionedAddress } from "../common";

function notImplemented(message: string) {
  warning(false, message);
}

export class CosmosGatekeeperSdk extends AbstractGatekeeperSdk {
  protected client: CosmosClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: CosmosChain;
    client: CosmosClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async contractAddressesQueryFn(
    _: string
  ): Promise<GatekeeperContractAddresses> {
    notImplemented(
      "fetchGatekeeperContractAddresses not implemented for Cosmos"
    );
    return {
      spendLimitGatekeeper: null,
      sessionKeyGatekeeper: null,
      debtGatekeeper: null,
    };
  }

  protected async permissionedAddressesQueryFn(
    _: string
  ): Promise<PermissionedAddress[]> {
    notImplemented("fetchPermissionedAddresses not implemented for Cosmos");
    return [];
  }
}
