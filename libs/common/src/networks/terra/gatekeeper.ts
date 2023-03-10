import { TerraChain } from "../../chains";
import { withLcdClient } from "../../clients";

export async function fetchGatekeeperContractAddresses({
  proxyAddress,
  chainId,
}: {
  proxyAddress: string;
  chainId: TerraChain;
}) {
  return await withLcdClient(chainId, async (client) => {
    const response = await client.wasm.contractQuery<{
      spendlimit_gatekeeper_contract_addr: string | null;
      sessionkey_gatekeeper_contract_addr: string | null;
      debt_gatekeeper_contract_addr: string | null;
    }>(proxyAddress, {
      gatekeeper_contracts: {},
    });

    return {
      spendLimitGatekeeper: response.spendlimit_gatekeeper_contract_addr,
      sessionKeyGatekeeper: response.sessionkey_gatekeeper_contract_addr,
      debtGatekeeper: response.debt_gatekeeper_contract_addr,
    };
  });
}

export interface PermissionedAddress {
  address: string;
  params: {
    address: string;
    period_type: "days" | "months";
    period_multiple: number;
    spend_limits: {
      denom: string;
      amount: string;
      current_balance: string;
      limit_remaining: string;
    }[];
  };
}

export async function fetchPermissionedAddresses({
  spendLimitGatekeeper,
  chainId,
}: {
  spendLimitGatekeeper: string;
  chainId: TerraChain;
}) {
  return await withLcdClient(chainId, async (client) => {
    const response = await client.wasm.contractQuery<{
      permissioned_addresses: PermissionedAddress[];
    }>(spendLimitGatekeeper, {
      permissioned_addresses: {},
    });

    return response.permissioned_addresses;
  });
}
