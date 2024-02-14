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
  getAccounts: () => Promise<string[]>;
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

  web3wallet.on("session_request", async (...params) => {
    console.log("incoming session_request", params);
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
      const chains = accounts.map((account) =>
        account.split(":").slice(0, 2).join(":"),
      );
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
            accounts,
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
  });

  return web3wallet;
}
