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
  web3wallet.on("session_proposal", async ({ id, params }) => {
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

    console.log("incoming session_proposal", { id, params });

    // try {
    //   const approvedNamespaces = buildApprovedNamespaces({
    //     proposal: params,
    //     supportedNamespaces: {
    //       cosmos: {
    //         chains: ["cosmos:cosmoshub-4"],
    //         methods: ["cosmos_signDirect"],
    //         accounts: ["cosmos:cosmoshub-4:foobar"],
    //         events: [],
    //       },
    //     },
    //   });
    //   const _session = await web3wallet.approveSession({
    //     id,
    //     namespaces: approvedNamespaces,
    //   });
    // } catch (error) {
    //   await web3wallet.rejectSession({
    //     id,
    //     reason: getSdkError("USER_REJECTED"),
    //   });
    // }
  });

  return web3wallet;
}
