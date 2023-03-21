import { Lookup } from "../src/app/screens/onboarding/lookup-proxy-wallets/lookup";
import { mockAction } from "../src/fixture-helpers";

export default (
  <Lookup
    chainId="phoenix-1"
    publicKey="AlLObpH8f6ea7ogc32Jpc2aLcZi3/O0K8zXw7OkZCA98"
    onSelect={async () => {
      mockAction("onSelect");
    }}
    onCancel={mockAction("onCancel")}
  />
);
