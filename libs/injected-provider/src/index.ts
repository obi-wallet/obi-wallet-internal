import { init } from "./init";
import { RNInjectedKeplr } from "./injected-provider";

// TODO: Set the Keplr version properly
const keplr = new RNInjectedKeplr("0.10.10", "mobile-web");

init(
  keplr,
  (chainId: string) => keplr.getOfflineSigner(chainId),
  (chainId: string) => keplr.getOfflineSignerOnlyAmino(chainId),
  (chainId: string) => keplr.getOfflineSignerAuto(chainId),
  (chainId: string) => keplr.getEnigmaUtils(chainId),
  (...args) => keplr.obiSignAndBroadcast(...args),
  (...args) => keplr.obiInAppPurchase(...args)
);
