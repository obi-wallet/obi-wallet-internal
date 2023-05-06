import invariant from "tiny-invariant";
import { z } from "zod";

import { TerraChainId } from "../../chains";
import { FeatherJsClient } from "../../clients";
import { AbstractGatekeeperSdk } from "../abstract";
import { GatekeeperContractAddresses, PermissionedAddress } from "../common";

export class TerraGatekeeperSdk extends AbstractGatekeeperSdk {
  protected client: FeatherJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: TerraChainId;
    client: FeatherJsClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async contractAddressesQueryFn(
    proxyAddress: string
  ): Promise<GatekeeperContractAddresses> {
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

  protected async permissionedAddressesQueryFn(
    proxyAddress: string
  ): Promise<PermissionedAddress[]> {
    const { spendLimitGatekeeper } = await this.contractAddresses(proxyAddress);
    invariant(spendLimitGatekeeper, "spendLimitGatekeeper is required");
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
}
