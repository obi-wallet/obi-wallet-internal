import { HomeChain } from "@/home-chain";
import { HomeChainId, SecretJsClient, UserEntryAddress } from "@obi-wallet/sdk";
import { z } from "zod";

export async function fetchOwner(wallet: {
  homeChainId: HomeChainId;
  userEntryAddress: UserEntryAddress;
}): Promise<string> {
  const client = new SecretJsClient(wallet.homeChainId);
  const homeChain = HomeChain.chainId(wallet.homeChainId);

  const userEntryCodeHash = await homeChain.userEntryCodeHash(
    wallet.userEntryAddress,
  );
  const { userAccountAddress, userAccountCodeHash } =
    await homeChain.userAccount({
      userEntryAddress: wallet.userEntryAddress,
      userEntryCodeHash,
    });

  const { legacy_owner } = await client.queryContract({
    contract: userAccountAddress,
    codeHash: userAccountCodeHash,
    query: { legacy_owner: {} },
    schema: z.object({
      legacy_owner: z.string(),
    }),
  });
  return legacy_owner;
}
