import {
  LegacyAminoMultisigPublicKey,
  MsgSend,
  RawKey,
  SimplePublicKey,
} from "@terra-money/terra.js";

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
});
