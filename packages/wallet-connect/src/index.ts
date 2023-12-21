import { Core } from "@walletconnect/core";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Web3Wallet } from "@walletconnect/web3wallet";

export async function setupWalletConnect({
  projectId,
  metadata,
}: {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}) {
  const core = new Core({
    projectId,
  });

  const web3wallet = await Web3Wallet.init({
    core,
    metadata,
  });

  // TODO:
  web3wallet.on("session_proposal", async ({ id, params }) => {
    try {
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          cosmos: {
            chains: ["cosmos:cosmoshub-4"],
            methods: ["cosmos_signDirect"],
            accounts: ["cosmos:cosmoshub-4:foobar"],
            events: [],
          },
        },
      });
      const _session = await web3wallet.approveSession({
        id,
        namespaces: approvedNamespaces,
      });
    } catch (error) {
      await web3wallet.rejectSession({
        id,
        reason: getSdkError("USER_REJECTED"),
      });
    }
  });

  return web3wallet;
}
