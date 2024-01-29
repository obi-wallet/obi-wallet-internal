import { fetchPublicKey } from "@/hooks/use-public-key";
import { TargetChain, TargetChainId } from "@/target-chain";
import { CosmosSdkSecretSigner } from "@/target-chain/cosmos-sdk/secret-signer";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import {
  ChainId,
  createGatekeeperConfig,
  credentialToKeyPair,
  KeyType,
  MultisigWallet,
  Sec256k1PrivateKey,
  Secp256k1PrivateKeySigner,
  SecretJsChainIds,
  SecretJsChains,
  SecretJsClient,
} from "@obi-wallet/sdk";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
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
  id: "BqrGB4NlGTSfryBzlIfrmg",
};
const wallet = {
  chainId: SecretJsChainIds.MAINNET,
  proxyAddress: "secret17ky4l978cpzp4lgrk5t4ag7xkg3sl5frmm4udn",
};

async function fetchPrivateKey(wallet: {
  chainId: ChainId;
  proxyAddress: string;
}): Promise<Sec256k1PrivateKey> {
  const passkeyKeyPair = await credentialToKeyPair(credential);
  const passkeySigner = new Secp256k1PrivateKeySigner(
    passkeyKeyPair.privateKey,
  );

  // @ts-expect-error Intentionally using protected method
  const msg = passkeySigner.createHash(Buffer.from("hello world"));

  const client = new SecretJsClient(wallet.chainId);
  const chain = SecretJsChains[wallet.chainId];

  const schema = z.object({
    exported: z.string(),
  });
  const response = await client.queryContract({
    contract: chain.secretSigner.address,
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

test("Keypair", async () => {
  const publicKey = await fetchPublicKey(wallet);
  const privateKey = await fetchPrivateKey(wallet);

  const privateKeySigner = new Secp256k1PrivateKeySigner(privateKey);
  const targetChain = TargetChain.chainId(TargetChainId.Sei);
  expect(targetChain.computeAddress(publicKey)).toEqual(
    targetChain.computeAddress(privateKeySigner.publicKey),
  );
});

test("Signing", async () => {
  // @ts-expect-error: Intentionally stripped down
  const signDoc: SignDoc = { memo: "foobar" };
  const publicKey = await fetchPublicKey(wallet);
  const address = TargetChain.chainId(TargetChainId.Sei).computeAddress(
    publicKey,
  );

  async function signWithUnderlyingPrivateKey() {
    const privateKey = await fetchPrivateKey(wallet);
    const signer = await DirectSecp256k1Wallet.fromKey(
      Buffer.from(privateKey, "base64"),
      "sei",
    );

    return await signer.signDirect(address, signDoc);
  }

  async function signWithSecretSigner() {
    const multisigWallet = MultisigWallet.create({
      type: "multisig",
      data: {
        chain: wallet.chainId,
        proxyAddress: {
          v: 1,
          address: wallet.proxyAddress,
        },
        owner: {
          keys: [
            {
              type: KeyType.Device,
              payload: await credentialToKeyPair(credential),
            },
          ],
          threshold: 1,
          evmSigningAddress: "MISSING",
          evmUserContractAddress: "MISSING",
        },
        evmSigningAddress: "MISSING",
        evmUserContractAddress: "MISSING",
        gatekeeperConfig: createGatekeeperConfig().toJSON(),
        singlesigWallets: [],
        currentAccount: null,
      },
    });
    const signer = await CosmosSdkSecretSigner.fromWallet(
      multisigWallet,
      TargetChainId.Sei,
    );
    return await signer.signDirect(address, signDoc);
  }

  expect(await signWithUnderlyingPrivateKey()).toEqual(
    await signWithSecretSigner(),
  );
});
