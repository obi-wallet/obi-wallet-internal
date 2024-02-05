import {
  HomeChainId,
  queryClient,
  QueryClientNamespace,
  SecretJsClient,
} from "@obi-wallet/sdk";
import invariant from "tiny-invariant";
import { z } from "zod";

export class SecretJsHomeChain {
  protected queryNamespace: QueryClientNamespace<
    "secret-js-home-chain",
    { chainId: HomeChainId }
  >;
  protected client: SecretJsClient;

  public constructor(protected chainId: HomeChainId) {
    this.queryNamespace = new QueryClientNamespace("secret-js-home-chain", {
      chainId,
    });
    this.client = new SecretJsClient(chainId);
  }

  public userEntryCodeHash(userEntryAddress: string) {
    return queryClient.fetchQuery(
      this.userEntryCodeHashQuery(userEntryAddress),
    );
  }

  public userEntryCodeHashQuery(userEntryAddress: string) {
    return this.queryNamespace.createQuery({
      name: "userEntryCodeHash",
      fn: async (userEntryAddress) => {
        const userEntryCodeHash = await this.client.withSecretNetworkClient(
          async (secretNetworkClient) => {
            const info = await secretNetworkClient.query.compute.contractInfo({
              contract_address: userEntryAddress,
            });
            const response =
              await secretNetworkClient.query.compute.codeHashByCodeId({
                // @ts-expect-error Secret Network SDK types are wrong
                code_id: info.contract_info.code_id,
              });
            return response.code_hash;
          },
        );
        invariant(
          typeof userEntryCodeHash === "string",
          "userEntryCodeHash must be a string",
        );
        return userEntryCodeHash;
      },
      params: userEntryAddress,
    });
  }

  public userAccount(params: {
    userEntryAddress: string;
    userEntryCodeHash: string;
  }) {
    return queryClient.fetchQuery(this.userAccountQuery(params));
  }

  public userAccountQuery(params: {
    userEntryAddress: string;
    userEntryCodeHash: string;
  }) {
    return this.queryNamespace.createQuery({
      name: "userAccount",
      fn: async ({ userEntryAddress, userEntryCodeHash }) => {
        const schema = z.object({
          user_account_address: z.string(),
          user_account_code_hash: z.string(),
        });
        const response = await this.client.withSecretNetworkClient(
          async (client) => {
            return await client.query.compute.queryContract({
              contract_address: userEntryAddress,
              code_hash: userEntryCodeHash,
              query: { user_account_address: {} },
            });
          },
        );
        const userAccount = schema.parse(response);
        return {
          userAccountAddress: userAccount.user_account_address,
          userAccountCodeHash: userAccount.user_account_code_hash,
        };
      },
      params,
    });
  }
}
