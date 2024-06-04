import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { Core } from "@walletconnect/core";
import { ErrorResponse } from "@walletconnect/jsonrpc-types";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Web3Wallet, Web3WalletTypes } from "@walletconnect/web3wallet";

export * from "./user-interactions";

export interface Account {
  namespace: string;
  chainId: string;
  address: string;
  publicKey: Secp256k1PublicKey;
}

export type SessionRequestPayload = Web3WalletTypes.SessionRequest["params"];
export type SessionRequestResponse =
  | { result: unknown }
  | { error: ErrorResponse };

export async function setupWalletConnect({
  projectId,
  metadata,
  getAccounts,
  handleSessionRequest,
}: {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  getAccounts: () => Promise<Account[]>;
  handleSessionRequest: (
    payload: SessionRequestPayload,
  ) => Promise<SessionRequestResponse>;
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
    const response = await handleSessionRequest(params);
    await web3wallet.respondSessionRequest({
      topic,
      response: {
        id,
        jsonrpc: "2.0",
        ...response,
      },
    });
  });

  web3wallet.on("auth_request", async (...params) => {
    console.log("incoming auth_request", params);
  });

  web3wallet.on("session_proposal", async (params) => {
    try {
      console.log("incoming session_proposal", params);

      // Automatically approve the session proposal for now
      const response = { approved: true };
      // const response = await WalletConnectPairingUserInteraction.start(params);

      if (response.approved) {
        const accounts = await getAccounts();
        const cosmosAccounts = accounts.filter((account) => {
          return account.namespace === "cosmos";
        });
        const evmAccounts = accounts.filter((account) => {
          return account.namespace === "eip155";
        });

        const buildChains = (accounts: Account[]) => {
          return accounts.map((account) => {
            return `${account.namespace}:${account.chainId}`;
          });
        };

        const buildAccounts = (accounts: Account[]) => {
          return accounts.map((account) => {
            return `${account.namespace}:${account.chainId}:${account.address}`;
          });
        };

        const approvedNamespaces = buildApprovedNamespaces({
          proposal: params.params,
          supportedNamespaces: {
            cosmos: {
              chains: buildChains(cosmosAccounts),
              methods: [
                "cosmos_getAccounts",
                "cosmos_signAmino",
                "cosmos_signDirect",
              ],
              accounts: buildAccounts(cosmosAccounts),
              events: ["chainChanged", "accountsChanged"],
            },
            eip155: {
              chains: buildChains(evmAccounts),
              methods: [
                "eth_sendTransaction",
                "personal_sign",
                "wallet_switchEthereumChain",
              ],
              accounts: buildAccounts(evmAccounts),
              events: ["chainChanged", "accountsChanged"],
            },
          },
        });
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
    } catch (e) {
      console.error(e);
    }
  });

  return web3wallet;
}
