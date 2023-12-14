import {
  createObservableWalletConnect,
  createWalletConnect,
} from "./factories";
import { WalletConnect as WalletConnectInterface } from "./implementation";
import { WalletConnectSchema } from "./schema";
import { AbstractDataStructure } from "../abstract";

export { WalletConnectConnector } from "./implementation";
export type WalletConnect = WalletConnectInterface;

export const WalletConnect = {
  schema: WalletConnectSchema,
  create: createWalletConnect,
} satisfies AbstractDataStructure<WalletConnect, typeof WalletConnectSchema>;

export const ObservableWalletConnect = {
  schema: WalletConnectSchema,
  create: createObservableWalletConnect,
} satisfies AbstractDataStructure<WalletConnect, typeof WalletConnectSchema>;
