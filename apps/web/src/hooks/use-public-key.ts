import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { staleTime } from "@/lib/stale-time";
import { useQuery } from "@obi-wallet/headless-ui";
import { SecretJsClient } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";
import { z } from "zod";

export function usePublicKey() {
  const wallet = useCurrentWallet({});
  const publicKeyQuery = useQuery({
    queryKey: ["public-key", wallet?.address],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      const client = new SecretJsClient(wallet.chainId);

      const schema = z.object({
        eth_pubkey: z.string(),
      });
      const response = await client.queryContract({
        contract: wallet.chain.secretSigner.address,
        query: {
          eth_pubkey: { user_entry_address: wallet.proxyAddress },
        },
        schema,
      });

      return {
        type: "tendermint/PubKeySecp256k1",
        value: Buffer.from(response.eth_pubkey, "hex").toString("base64"),
      };
    },
    enabled: !!wallet,
    staleTime: staleTime({ minute: 5 }),
  });

  return publicKeyQuery.data;
}
