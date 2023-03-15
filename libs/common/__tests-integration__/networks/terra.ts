import {
  generateSec256k1KeyPair,
  TerraChain,
  terraChains,
} from "@obi-wallet/sdk";
import {
  LegacyAminoMultisigPublicKey,
  MsgSend,
  RawKey,
  SimplePublicKey,
} from "@terra-money/feather.js";

import { terra } from "../../src";
import { getNewAccountMessage } from "../../src/networks/terra/messages";
import { wrapMessages } from "../../src/networks/terra/wrap-messages";

const {
  chainId,
  privateKey,
  publicKey,
  proxyAddress,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("./terra.config.json") as {
  chainId: TerraChain;
  privateKey: string;
  publicKey: string;
  proxyAddress: {
    address: string;
    codeId: number;
  };
};

const key = new RawKey(Buffer.from(privateKey, "base64"));
const address = key.accAddress("terra");

const multisigKey = new LegacyAminoMultisigPublicKey(1, [
  new SimplePublicKey(publicKey),
]);
const multisigAddress = multisigKey.address("terra");

jest.setTimeout(1000 * 60);

test("createAndSignMultisigTransaction", async () => {
  const message = new MsgSend(multisigAddress, multisigAddress, { uluna: 1 });
  const { signDoc, sign } = await terra.createMultisigTransaction({
    key: multisigKey,
    messages: [message],
    chainId,
  });
  const signature = await key.createSignatureAmino(signDoc);
  const transaction = sign([signature]);
  expect(
    await terra.simulateTransaction({ transaction, chainId })
  ).toBeDefined();
});

test("createAndSignMultisigTransaction (second key signs)", async () => {
  const { publicKey: publicKey2, privateKey: privateKey2 } =
    generateSec256k1KeyPair();
  const key2 = new RawKey(Buffer.from(privateKey2, "base64"));

  const multisigKey2 = new LegacyAminoMultisigPublicKey(1, [
    new SimplePublicKey(publicKey),
    new SimplePublicKey(publicKey2.value),
  ]);
  const multisigAddress2 = multisigKey2.address("terra");
  const message = new MsgSend(multisigAddress2, multisigAddress2, { uluna: 1 });
  const { signDoc, sign } = await terra.createMultisigTransaction({
    key: multisigKey2,
    messages: [message],
    chainId,
  });
  const signature = await key2.createSignatureAmino(signDoc);
  const transaction = sign([signature]);
  expect(
    await terra.simulateTransaction({ transaction, chainId })
  ).toBeDefined();
});

test("NewAccount", async () => {
  const message = getNewAccountMessage({
    address: multisigAddress,
    signers: [{ address, ty: "raw" }],
    chainId,
  });
  const { signDoc, sign } = await terra.createMultisigTransaction({
    key: multisigKey,
    messages: [message],
    chainId,
  });
  const signature = await key.createSignatureAmino(signDoc);
  const transaction = sign([signature]);
  expect(
    await terra.simulateTransaction({ transaction, chainId })
  ).toBeDefined();
});

describe("MultisigWallet", () => {
  test("MsgSend", async () => {
    const message = new MsgSend(proxyAddress.address, proxyAddress.address, {
      uluna: 1,
    });
    const { signDoc, sign } = await terra.createMultisigTransaction({
      key: multisigKey,
      messages: wrapMessages({
        messages: [message],
        sender: multisigAddress,
        contract: proxyAddress.address,
      }),
      chainId,
    });
    const signature = await key.createSignatureAmino(signDoc);
    const transaction = sign([signature]);
    expect(
      await terra.simulateTransaction({ transaction, chainId })
    ).toBeDefined();
  });

  test.todo("Propose update owner");

  test("MsgDelegate", async () => {
    const message = terra.getStakeMessage({
      sender: multisigKey.address("terra"),
      validator: terraChains[chainId].obiValidator,
      amount: 1,
      chainId,
    });
    const { signDoc, sign } = await terra.createMultisigTransaction({
      key: multisigKey,
      messages: [message],
      chainId,
    });
    const signature = await key.createSignatureAmino(signDoc);
    const transaction = sign([signature]);
    expect(
      await terra.simulateTransaction({ transaction, chainId })
    ).toBeDefined();
  });
});
