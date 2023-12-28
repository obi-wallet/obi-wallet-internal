import { Config } from "./config";
import { obiMobileConfig } from "./obi-mobile";

export const obiMobileMultichainConfig: Config = {
  ...obiMobileConfig,
  chains: {
    enabled: ["pulsar-3", "secret-4"],
    default: "secret-4",
  },
};
