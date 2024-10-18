import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { Core } from "@walletconnect/core";
import { ErrorResponse } from "@walletconnect/jsonrpc-types";
import {
  buildApprovedNamespaces,
  BuildApprovedNamespacesParams,
  getSdkError,
} from "@walletconnect/utils";
import { Web3Wallet, Web3WalletTypes } from "@walletconnect/web3wallet";

export * from "./user-interactions";

export interface Account {
  namespace: string;
  chainId: string;
  address: string;
  publicKey: Secp256k1PublicKey;
}

export interface Key {
  name: string;
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  bech32Address: string;
  ethereumHexAddress: string;
  isNanoLedger: boolean;
  isKeystone: boolean;
  chainId: string;
}

export type SessionRequestPayload = Web3WalletTypes.SessionRequest["params"];
export type SessionRequestResponse =
  | { result: unknown }
  | { error: ErrorResponse };

export async function setupWalletConnect({
  projectId,
  metadata,
  getSupportedNamespaces,
  getKeys,
  handleSessionRequest,
}: {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  getSupportedNamespaces: () => Promise<
    BuildApprovedNamespacesParams["supportedNamespaces"]
  >;
  getKeys: () => Promise<Key[]>;
  handleSessionRequest: (
    payload: SessionRequestPayload,
  ) => Promise<SessionRequestResponse>;
}) {
  const core = new Core({
    projectId,
  });

  const web3wallet = await Web3Wallet.init({
    // @ts-expect-error This is only an `exactOptionalPropertyTypes` error in third-party types
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
        const approvedNamespaces = buildApprovedNamespaces({
          proposal: params.params,
          supportedNamespaces: await getSupportedNamespaces(),
        });
        const keys = await getKeys();
        const chainTypes = Object.keys(approvedNamespaces);
        const chainIds = chainTypes
          .map((chainType) => {
            return approvedNamespaces?.[chainType]?.chains ?? [];
          })
          .flat();
        const keysForChainIds = keys.filter((key) => {
          return chainIds.includes(key.chainId);
        });
        const _session = await web3wallet.approveSession({
          id: params.id,
          namespaces: approvedNamespaces,
          sessionProperties: {
            // eslint-disable-next-line no-restricted-globals
            keys: JSON.stringify(keysForChainIds),
          },
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
