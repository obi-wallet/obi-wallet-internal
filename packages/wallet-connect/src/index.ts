import { Core } from "@walletconnect/core";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Web3Wallet } from "@walletconnect/web3wallet";

import { WalletConnectPairingUserInteraction } from "./user-interaction";
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

  // TODO:
  web3wallet.on("session_proposal", async (params) => {
    console.log("incoming session_proposal", params);

    const response = await WalletConnectPairingUserInteraction.start(params);
    if (response.approved) {
      // TODO: Here we need to fetch the addresses etc. from the store somehow
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params.params,
        supportedNamespaces: {
          cosmos: {
            chains: ["cosmos:neutron-1"],
            methods: [
              "cosmos_getAccounts",
              "cosmos_signAmino",
              "cosmos_signDirect",
            ],
            accounts: await getAccounts(),
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
    const _examplePayload = {
      id: 1707743595483114,
      params: {
        id: 1707743595483114,
        pairingTopic:
          "5f3a6ea5ba2337c3d4fd443f4ebb27032fa798c94271d77134d9f8047846adb1",
        expiry: 1707743911,
        requiredNamespaces: {
          cosmos: {
            methods: ["cosmos_signDirect", "cosmos_signAmino"],
            chains: ["cosmos:cosmoshub-4"],
            events: [],
          },
        },
        optionalNamespaces: {},
        relays: [
          {
            protocol: "irn",
          },
        ],
        proposer: {
          publicKey:
            "5d31c5a6e03fd76e63209e1b684e94b5e49d550aa975b9d0ff752df8a1901113",
          metadata: {
            description: "React App for WalletConnect",
            url: "https://react-dapp-v2-cosmos-provider.vercel.app",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
            name: "React App",
          },
        },
      },
    };
  });

  return web3wallet;
}
