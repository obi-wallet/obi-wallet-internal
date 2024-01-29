import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { staleTime } from "@/lib/stale-time";
import { useQuery } from "@obi-wallet/headless-ui";
import { ChainId, SecretJsChains, SecretJsClient } from "@obi-wallet/sdk";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import invariant from "tiny-invariant";
import { z } from "zod";

export async function fetchPublicKey(wallet: {
  chainId: ChainId;
  proxyAddress: string;
}): Promise<Secp256k1PublicKey> {
  const client = new SecretJsClient(wallet.chainId);
  const chain = SecretJsChains[wallet.chainId];

  const schema = z.object({
    eth_pubkey: z.string(),
  });
  const response = await client.queryContract({
    contract: chain.secretSigner.address,
    query: {
      eth_pubkey: { user_entry_address: wallet.proxyAddress },
    },
    schema,
  });

  return {
    type: "tendermint/PubKeySecp256k1",
    value: Buffer.from(response.eth_pubkey, "hex").toString("base64"),
  };
}

export function usePublicKey() {
  const wallet = useCurrentWallet({});
  const publicKeyQuery = useQuery({
    queryKey: ["public-key", wallet?.proxyAddress],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      return await fetchPublicKey(wallet);
    },
    enabled: !!wallet,
    staleTime: staleTime({ minute: 5 }),
  });

  return publicKeyQuery.data;
}
