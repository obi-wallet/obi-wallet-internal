import { Msg } from "@terra-money/feather.js";
import WalletConnectConnector from "@walletconnect/client";
import {
  IWalletConnectOptions,
  IWalletConnectSession,
} from "@walletconnect/types";
import * as R from "ramda";

import { WalletConnectSchema } from "./schema";
// import { isTerraChain } from "../../chains";
import {
  InitiateWalletConnectSessionUserInteraction,
  SignAndBroadcastTransactionUserInteraction,
} from "../../user-interactions";
import { AbstractMigratable, AbstractSerialized } from "../migratable";
import { WalletMeta } from "../multisig-wallet";
import { Wallets } from "../wallets";

export { WalletConnectConnector };

enum ErrorCodeEnum {
  userDenied = 1, // User Denied
  createTxFailed = 2, // CreateTxFailed (no Txhash)
  txFailed = 3, // TxFailed (Broadcast with Txhash with fail)
  timeOut = 4, // Timeout
  etc = 99,
}
function createWalletConnectConnector(connectorOpts: IWalletConnectOptions) {
  return new WalletConnectConnector({
    ...connectorOpts,
    clientMeta: {
      description: "Obi Wallet",
      url: "https://obi.money/",
      icons: [],
      name: "Station",
    },
  });
}

type HandshakeTopic = string;

export interface ConnectInformation {
  connector: WalletConnectConnector;
  walletMeta: WalletMeta;
}

export class WalletConnect {
  public get schema() {
    return WalletConnectSchema;
  }

  protected _connectors: Record<HandshakeTopic, ConnectInformation> = {};
  public constructor(protected wallets: Wallets) {}

  public toJSON(): AbstractSerialized<typeof WalletConnectSchema> {
    return R.pipe<
      [Record<HandshakeTopic, ConnectInformation>],
      [HandshakeTopic, ConnectInformation][],
      [HandshakeTopic, ConnectInformation][],
      [
        HandshakeTopic,
        {
          session: IWalletConnectSession;
          walletMeta: WalletMeta;
        },
      ][],
      Record<
        HandshakeTopic,
        {
          session: IWalletConnectSession;
          walletMeta: WalletMeta;
        }
      >
    >(
      R.toPairs,
      R.filter(([_, info]) => info.connector.connected),
      R.map(([topic, info]) => [
        topic,
        {
          session: info.connector.session,
          walletMeta: info.walletMeta,
        },
      ]),
      R.fromPairs,
    )(this._connectors);
  }

  public get connectors() {
    return Object.values(this._connectors);
  }

  public async connect({
    uri,
    walletMeta,
  }: {
    uri: string;
    walletMeta: WalletMeta;
  }) {
    const connector = createWalletConnectConnector({ uri });
    if (!connector.connected) {
      await connector.createSession();
    }
    await this.attachEventHandlers({ connector, walletMeta });
  }

  public async disconnect(connector: WalletConnectConnector) {
    const { handshakeTopic } = connector;
    if (connector.connected) {
      await connector.killSession();
    } else {
      connector.rejectSession();
    }
    this.removeConnector(handshakeTopic);
  }

  public async recoverConnectors(
    migratable: AbstractMigratable<typeof WalletConnectSchema>,
  ) {
    try {
      const data = WalletConnectSchema.migratableSchema.parse(migratable);
      await Promise.all(
        R.values(
          R.mapObjIndexed(async (info, topic) => {
            if (this._connectors[topic]) return;
            const connector = createWalletConnectConnector({
              session: info.session as IWalletConnectSession,
            });
            await this.recoverConnector({
              connector,
              walletMeta: info.walletMeta,
            });
          }, data),
        ),
      );
    } catch (e) {
      // noop
    }
  }

  protected async recoverConnector({
    connector,
    walletMeta,
  }: ConnectInformation) {
    if (connector.handshakeTopic) {
      this._connectors[connector.handshakeTopic] = {
        connector,
        walletMeta,
      };
      await this.attachEventHandlers({ connector, walletMeta });
    }
  }

  protected async attachEventHandlers({
    connector,
    walletMeta,
  }: ConnectInformation) {
    const topic = connector.handshakeTopic;
    const wallet = this.wallets.getWalletByProxyAddress(walletMeta.walletId);
    if (!wallet) {
      this.removeConnector(topic);
      return;
    }

    const address = wallet.getAddressByAccountMeta(walletMeta.currentAccount);

    connector.on("session_request", async (error, payload) => {
      if (error) {
        throw error;
      }

      const { peerMeta } = payload.params[0];
      console.log("session-request", peerMeta);

      try {
        const response =
          await InitiateWalletConnectSessionUserInteraction.start({
            peerMeta,
            walletMeta,
          });
        if (response.approved) {
          connector.approveSession({
            accounts: [address],
            chainId: 1,
          });
          this.saveConnector({ connector, walletMeta });
          return;
        }
      } catch (e) {
        console.log(e);
      }

      connector.rejectSession();
    });

    connector.on("session_update", (error) => {
      console.log("EVENT", "session_update");

      if (error) {
        throw error;
      }
    });

    connector.on("call_request", async (error, payload) => {
      const { id, method, params } = payload as {
        id: number;
        method: string;
        params: unknown[];
      };

      if (error) {
        throw error;
      }

      switch (method) {
        case "post": {
          try {
            // invariant(
            //   isTerraChain(wallet?.chainId),
            //   "Expected wallet to be terra multisig.",
            // );

            const { msgs } = params[0] as {
              msgs: string[];
            };
            const messages = msgs.map((msg): Msg => {
              const data = JSON.parse(msg);
              const isAmino = R.has("type", data);
              return isAmino
                ? Msg.fromAmino(data as Msg.Amino)
                : Msg.fromData(data);
            });

            const response =
              await SignAndBroadcastTransactionUserInteraction.start({
                messages,
                demoMode: wallet.isDemo,
                cancelable: true,
                walletMeta,
              });
            if (response.approved) {
              if (response.payload.success) {
                connector.approveRequest({
                  id,
                  result: response.payload.rawResult,
                });
              } else {
                connector.rejectRequest({
                  id,
                  error: {
                    message: JSON.stringify({
                      code: ErrorCodeEnum.txFailed,
                      message: response.payload.rawLog,
                      txHash: response.payload.transactionHash,
                      raw_message: response.payload.rawResult,
                    }),
                  },
                });
              }
            } else {
              connector.rejectRequest({
                id,
                error: {
                  message: JSON.stringify({
                    code: ErrorCodeEnum.userDenied,
                    message: "Denied by user",
                  }),
                },
              });
            }
          } catch (e) {
            const error = e as Error;
            connector.rejectRequest({
              id,
              error: {
                message: JSON.stringify({
                  code: ErrorCodeEnum.etc,
                  message: error.message,
                }),
              },
            });
            console.error(e);
          }
          break;
        }
        default:
          connector.rejectRequest({
            id,
            error: {
              message: JSON.stringify({
                code: ErrorCodeEnum.etc,
                message: "Unknown call_request",
              }),
            },
          });
      }
    });

    connector.on("connect", (error, payload) => {
      console.log("EVENT", "connect", payload);

      if (error) {
        throw error;
      }
    });

    connector.on("disconnect", (error, payload) => {
      console.log("EVENT", "disconnect", payload);

      if (error) {
        throw error;
      }

      this.removeConnector(topic);
    });
  }

  protected saveConnector({ connector, walletMeta }: ConnectInformation) {
    this._connectors[connector.handshakeTopic] = {
      connector,
      walletMeta,
    };
  }

  protected removeConnector(topic: HandshakeTopic) {
    this._connectors = R.omit([topic], this._connectors);
  }
}
