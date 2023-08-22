import { obiModalConfig } from "./obi";
import { Config } from "../config";

export const obiEthereumModalConfig: Config = {
  ...obiModalConfig,
  chains: {
    enabled: ["phoenix-1"],
    default: "phoenix-1",
  },
};
