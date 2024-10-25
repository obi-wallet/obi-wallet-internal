import warning from "tiny-warning";

import { AbstractGatekeeperSdk } from "./abstract";
import { HomeChainId } from "../../home-chains";
import { GatekeeperContractAddresses, PermissionedAddress } from "../common";

function notImplemented(message: string) {
  warning(false, message);
}

export class NotImplementedGatekeeperSdk extends AbstractGatekeeperSdk {
  public constructor(chainId: HomeChainId) {
    super(chainId);
  }

  protected async contractAddressesQueryFn(
    _: string,
  ): Promise<GatekeeperContractAddresses> {
    notImplemented("fetchGatekeeperContractAddresses not implemented");
    return {
      spendLimitGatekeeper: null,
      sessionKeyGatekeeper: null,
      debtGatekeeper: null,
    };
  }

  protected async permissionedAddressesQueryFn(
    _: string,
  ): Promise<PermissionedAddress[]> {
    notImplemented("fetchPermissionedAddresses not implemented");
    return [];
  }
}
