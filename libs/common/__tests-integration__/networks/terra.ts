import {
  LegacyAminoMultisigPublicKey,
  MsgSend,
  RawKey,
  SimplePublicKey,
} from "@terra-money/terra.js";
import { randomBytes } from "crypto";
import secp256k1 from "secp256k1";

import { terra } from "../../src";
import { getNewAccountMessage } from "../../src/networks/terra/messages";
import { wrapMessages } from "../../src/networks/terra/wrap-messages";

const {
  chainId,
  privateKey,
  publicKey,
  proxyAddress,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("./terra.config.json");

const key = new RawKey(Buffer.from(privateKey, "base64"));
const address = key.accAddress;

const multisigKey = new LegacyAminoMultisigPublicKey(1, [
  new SimplePublicKey(publicKey),
]);
const multisigAddress = multisigKey.address();

jest.setTimeout(1000 * 60);

test("createAndSignSinglesigTransaction", async () => {
  const message = new MsgSend(address, address, { uluna: 1 });
  const transaction = await terra.createAndSignSinglesigTransaction({
    key,
    chainId,
    messages: [message],
  });
  expect(
    await terra.simulateTransaction({ transaction, chainId })
  ).toBeDefined();
});

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
  const privateKeyBuffer2 = randomBytes(32);
  const publicKeyBuffer2 = secp256k1.publicKeyCreate(privateKeyBuffer2);

  const privateKey2 = Buffer.from(privateKeyBuffer2).toString("base64");
  const publicKey2 = Buffer.from(publicKeyBuffer2).toString("base64");

  const key2 = new RawKey(Buffer.from(privateKey2, "base64"));

  const multisigKey2 = new LegacyAminoMultisigPublicKey(1, [
    new SimplePublicKey(publicKey),
    new SimplePublicKey(publicKey2),
  ]);
  const multisigAddress2 = multisigKey2.address();
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

  // This fails when wallet already up-to-date.
  test.skip("MsgMigrateContract", async () => {
    const message = terra.getMigrateMessage({
      admin: multisigKey.address(),
      proxyAddress: proxyAddress.address,
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

  // TODO:
  test.skip("Propose update owner", async () => {
    const message = terra.getProposeUpdateOwnerMessage({
      sender: multisigKey.address(),
      newOwner: "terra18aw4eedj4v3253dvj9h5ucx9uedl9ggaayktq4",
      proxyAddress: proxyAddress.address,
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
