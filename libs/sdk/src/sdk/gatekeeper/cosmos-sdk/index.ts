import invariant from "tiny-invariant";
import { z } from "zod";

import { CosmosChainId, TerraChainId } from "../../../chains";
import { AbstractClient } from "../../../clients";
import { GatekeeperContractAddresses, PermissionedAddress } from "../../common";
import { AbstractGatekeeperSdk } from "../abstract";

export class CosmosSdkGatekeeperSdk extends AbstractGatekeeperSdk {
  protected client: AbstractClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: CosmosChainId | TerraChainId;
    client: AbstractClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async contractAddressesQueryFn(
    proxyAddress: string
  ): Promise<GatekeeperContractAddresses> {
    return await this.client.queryContract({
      contract: proxyAddress,
      query: {
        gatekeeper_contracts: {},
      },
      schema: z
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
        }),
    });
  }

  protected async permissionedAddressesQueryFn(
    proxyAddress: string
  ): Promise<PermissionedAddress[]> {
    const { spendLimitGatekeeper } = await this.contractAddresses(proxyAddress);
    invariant(spendLimitGatekeeper, "spendLimitGatekeeper is required");
    const { permissioned_addresses } = await this.client.queryContract({
      contract: spendLimitGatekeeper,
      query: {
        permissioned_addresses: {},
      },
      schema: z.object({
        permissioned_addresses: z.array(PermissionedAddress),
      }),
    });
    return permissioned_addresses;
  }
}
