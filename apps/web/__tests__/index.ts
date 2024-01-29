import { fetchPublicKey } from "@/hooks/use-public-key";
import { TargetChain, TargetChainId } from "@/target-chain";
import {
  ChainId,
  credentialToKeyPair,
  Sec256k1PrivateKey,
  Secp256k1PrivateKeySigner,
  SecretJsChainIds,
  SecretJsChains,
  SecretJsClient,
} from "@obi-wallet/sdk";
import { z } from "zod";

jest.mock("nanoid/non-secure", () => {
  let i = 0;
  return {
    nanoid() {
      return i++;
    },
  };
});

const credential = {
  id: "GM_aSNlyKIJV9IQK4ZgVug",
};
const wallet = {
  chainId: SecretJsChainIds.MAINNET,
  proxyAddress: "secret1nm90zt30754vslean77ljpej8frntdxxp4psfv",
};

test("Keypair", async () => {
  const passkeyKeyPair = await credentialToKeyPair(credential);
  const passkeySigner = new Secp256k1PrivateKeySigner(
    passkeyKeyPair.privateKey,
  );

  // @ts-expect-error Intentionally using protected method
  const msg = passkeySigner.createHash(Buffer.from("hello world"));

  async function fetchPrivateKey(wallet: {
    chainId: ChainId;
    proxyAddress: string;
  }): Promise<Sec256k1PrivateKey> {
    const client = new SecretJsClient(wallet.chainId);
    const chain = SecretJsChains[wallet.chainId];

    const schema = z.object({
      exported: z.string(),
    });
    const response = await client.queryContract({
      contract: chain.secretSigner.address,
      // code_hash: chain.secretSigner.codeHash,
      query: {
        recover: {
          user_entry_address: wallet.proxyAddress,
          user_entry_code_hash: chain.userEntry.codeHash,
          bytes: Buffer.from(msg).toString("hex"),
          bytes_signed_by_signers: [
            Buffer.from(await passkeySigner.signHash(msg)).toString("hex"),
          ],
          prepend: false,
        },
      },
      schema,
    });
    return Buffer.from(response.exported, "hex").toString("base64");
  }

  const publicKey = await fetchPublicKey(wallet);
  const privateKey = await fetchPrivateKey(wallet);

  const privateKeySigner = new Secp256k1PrivateKeySigner(privateKey);
  const targetChain = TargetChain.chainId(TargetChainId.Sei);
  expect(targetChain.computeAddress(publicKey)).toEqual(
    targetChain.computeAddress(privateKeySigner.publicKey),
  );
});
