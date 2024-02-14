import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { Core } from "@walletconnect/core";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Web3Wallet } from "@walletconnect/web3wallet";

export * from "./user-interaction";

export async function setupWalletConnect({
  projectId,
  metadata,
  getAccounts,
}: {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  getAccounts: () => Promise<
    {
      namespace: string;
      chainId: string;
      address: string;
      publicKey: Secp256k1PublicKey;
    }[]
  >;
}) {
  const core = new Core({
    projectId,
  });

  const web3wallet = await Web3Wallet.init({
    core,
    metadata,
  });

  web3wallet.on("session_delete", async (...params) => {
    console.log("incoming session_delete", params);
  });

  web3wallet.on("session_request", async (event) => {
    console.log("incoming session_request", event);

    const { topic, params, id } = event;
    const { request } = params;

    switch (request.method) {
      case "cosmos_getAccounts": {
        const { chainId } = params;
        console.log(chainId);

        const accounts = await getAccounts();
        const result = accounts
          .filter((account) => {
            return `${account.namespace}:${account.chainId}` === chainId;
          })
          .map((account) => {
            return {
              algo: "secp256k1",
              address: account.address,
              pubkey: Buffer.from(
                getSec256k1CompressedPublicKey(account.publicKey),
              ).toString("base64"),
            };
          });

        console.log(result);

        const response = {
          id,
          jsonrpc: "2.0",
          result,
        };

        await web3wallet.respondSessionRequest({ topic, response });
      }
    }
  });

  web3wallet.on("auth_request", async (...params) => {
    console.log("incoming auth_request", params);
  });

  web3wallet.on("session_proposal", async (params) => {
    console.log("incoming session_proposal", params);

    // Automatically approve the session proposal for now
    const response = { approved: true };
    // const response = await WalletConnectPairingUserInteraction.start(params);

    if (response.approved) {
      const accounts = await getAccounts();
      const chains = accounts.map((account) => {
        return `${account.namespace}:${account.chainId}`;
      });
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params.params,
        supportedNamespaces: {
          cosmos: {
            chains: chains,
            methods: [
              "cosmos_getAccounts",
              "cosmos_signAmino",
              "cosmos_signDirect",
            ],
            accounts: accounts.map((account) => {
              return `${account.namespace}:${account.chainId}:${account.address}`;
            }),
            events: ["chainChanged", "accountsChanged"],
          },
        },
      });
      console.log(approvedNamespaces);
      const _session = await web3wallet.approveSession({
        id: params.id,
        namespaces: approvedNamespaces,
      });
    } else {
      await web3wallet.rejectSession({
        id: params.id,
        reason: getSdkError("USER_REJECTED"),
      });
    }
  });

  return web3wallet;
}
