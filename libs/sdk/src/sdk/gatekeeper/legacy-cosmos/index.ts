import warning from "tiny-warning";

import { LegacyCosmosChainId } from "../../../chains";
import { CosmJsClient } from "../../../clients";
import { GatekeeperContractAddresses, PermissionedAddress } from "../../common";
import { AbstractGatekeeperSdk } from "../abstract";

function notImplemented(message: string) {
  warning(false, message);
}

export class LegacyCosmosGatekeeperSdk extends AbstractGatekeeperSdk {
  protected client: CosmJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: LegacyCosmosChainId;
    client: CosmJsClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async contractAddressesQueryFn(
    _: string,
  ): Promise<GatekeeperContractAddresses> {
    notImplemented(
      "fetchGatekeeperContractAddresses not implemented for Cosmos",
    );
    return {
      spendLimitGatekeeper: null,
      sessionKeyGatekeeper: null,
      debtGatekeeper: null,
    };
  }

  protected async permissionedAddressesQueryFn(
    _: string,
  ): Promise<PermissionedAddress[]> {
    notImplemented("fetchPermissionedAddresses not implemented for Cosmos");
    return [];
  }
}
