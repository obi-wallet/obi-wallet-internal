import { KVStore } from "@keplr-wallet/common";
import { isTxError, Msg } from "@terra-money/terra.js";
import WalletConnect from "@walletconnect/client";
import {
  IWalletConnectOptions,
  IWalletConnectSession,
} from "@walletconnect/types";
import { action, computed, makeObservable, observable, toJS } from "mobx";
import * as R from "ramda";
import invariant from "tiny-invariant";

import { WalletsStore } from "./wallets";
import {
  RequestObiTerraSignAndBroadcastMsg,
  RequestObiWalletConnectMsg,
} from "../background";
import { isTerraChain } from "../chains";

enum ErrorCodeEnum {
  userDenied = 1, // User Denied
  createTxFailed = 2, // CreateTxFailed (no Txhash)
  txFailed = 3, // TxFailed (Broadcast with Txhash with fail)
  timeOut = 4, // Timeout
  etc = 99,
}

function createWalletConnect(connectorOpts: IWalletConnectOptions) {
  return new WalletConnect({
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

// TODO: add walletConnectID to terra chain (mainnet 1, testnet 0)
export class WalletConnectStore {
  protected readonly kvStore: KVStore;
  protected readonly walletsStore: WalletsStore;

  public __initPromise: Promise<void>;

  @observable
  protected _connectors: Record<HandshakeTopic, WalletConnect> = {};

  constructor({
    kvStore,
    walletsStore,
  }: {
    kvStore: KVStore;
    walletsStore: WalletsStore;
  }) {
    this.kvStore = kvStore;
    this.walletsStore = walletsStore;
    makeObservable(this);
    this.__initPromise = this.init();
  }

  @action
  public async addConnector(uri: string) {
    const connector = createWalletConnect({
      uri,
    });

    if (!connector.connected) {
      await connector.createSession();
    }

    this.attachEventHandlers(connector);
  }

  @computed
  public get connectors() {
    return Object.values(this._connectors);
  }

  @action
  public async recoverConnectors() {
    const data = await this.kvStore.get<
      Record<HandshakeTopic, IWalletConnectSession>
    >("sessions");
    R.forEachObjIndexed((session, topic) => {
      if (this._connectors[topic]) return;
      const connector = createWalletConnect({
        session,
      });
      this.recoverConnector(connector);
    }, data);
    await this.save();
  }

  @action
  protected async saveConnector(connector: WalletConnect) {
    this._connectors[connector.handshakeTopic] = connector;
    await this.save();
  }

  @action
  protected recoverConnector(connector: WalletConnect) {
    if (connector.handshakeTopic) {
      this._connectors[connector.handshakeTopic] = connector;
      this.attachEventHandlers(connector);
    }
  }

  @action
  protected async removeConnector(topic: HandshakeTopic) {
    this._connectors = R.omit([topic], this._connectors);
    await this.save();
  }

  @action
  public async disconnectConnector(connector: WalletConnect) {
    const { handshakeTopic } = connector;
    if (connector.connected) {
      await connector.killSession();
    } else {
      connector.rejectSession();
    }
    await this.removeConnector(handshakeTopic);
  }

  protected async init() {
    await this.recoverConnectors();
  }

  protected async save() {
    const sessions = R.pipe<
      [Record<HandshakeTopic, WalletConnect>],
      [HandshakeTopic, WalletConnect][],
      [HandshakeTopic, WalletConnect][],
      [HandshakeTopic, IWalletConnectSession][],
      Record<HandshakeTopic, IWalletConnectSession>
    >(
      R.toPairs,
      R.filter(([_, connector]) => connector.connected),
      R.map(([topic, connector]) => [topic, connector.session]),
      R.fromPairs
    )(this._connectors);
    await this.kvStore.set("sessions", toJS(sessions));
  }

  protected attachEventHandlers(connector: WalletConnect) {
    const topic = connector.handshakeTopic;

    // TODO: Do that somewhere else
    connector.on("session_request", async (error, payload) => {
      if (error) {
        throw error;
      }

      const { peerMeta } = payload.params[0];
      console.log("session-request", peerMeta);
      try {
        await RequestObiWalletConnectMsg.send({
          type: "session-request",
          peerMeta,
        });
        connector.approveSession({
          // TODO: Maybe pass via send response instead
          // TODO: also save wallet id here
          accounts: [this.walletsStore.address!],
          chainId: 1,
        });
        await this.saveConnector(connector);
      } catch (e) {
        connector.rejectSession();
      }
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
            // TODO: get from connector instead;
            const wallet = this.walletsStore.currentWallet;

            invariant(wallet, "Expected current wallet to be defined.");

            invariant(
              isTerraChain(wallet?.chain),
              "Expected wallet to be terra multisig."
            );

            const multisigKey = wallet.owner;

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

            console.log(messages.map((msg) => msg.toAmino()));

            try {
              // TODO: handle current account
              const response = await RequestObiTerraSignAndBroadcastMsg.send({
                multisigKey: multisigKey.serialize(),
                messages: messages.map((msg) => msg.toAmino()),
                demoMode: wallet.isDemo,
                proxyAddress: wallet.address,
                cancelable: true,
              });
              if (isTxError(response)) {
                connector.rejectRequest({
                  id,
                  error: {
                    message: JSON.stringify({
                      code: ErrorCodeEnum.txFailed,
                      message: response.raw_log,
                      txHash: response.txhash,
                      raw_message: response,
                    }),
                  },
                });
              } else {
                connector.approveRequest({
                  id,
                  result: response,
                });
              }
            } catch (e) {
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

      // this.setState({ connected: true });
    });

    connector.on("disconnect", async (error, payload) => {
      console.log("EVENT", "disconnect", payload);

      if (error) {
        throw error;
      }

      await this.removeConnector(topic);
    });
  }
}
