import {
  MultisigPublicKey,
  Secp256k1KeyPair,
  Secp256k1PrivateKeySigner,
} from "../src";

const keyPair: Secp256k1KeyPair = {
  publicKey: {
    type: "tendermint/PubKeySecp256k1",
    value: "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI",
  },
  privateKey: "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=",
};

jest.setTimeout(60_000);

// describe("Sec256k1PrivateKeySigner", () => {
//   describe("prepareSigner", () => {
//     test("Cosmos", async () => {
//       await Sdk.chainId("juno-1").transactions.prepareKeyPair(keyPair);
//     });

//     test("Terra", async () => {
//       await Sdk.chainId("phoenix-1").transactions.prepareKeyPair(keyPair);
//     });
//   });
// });

describe("MultisigSigner", () => {
  let signer: Secp256k1PrivateKeySigner;
  let _multisigPublicKey: MultisigPublicKey;

  beforeEach(() => {
    signer = new Secp256k1PrivateKeySigner(keyPair.privateKey);
    _multisigPublicKey = {
      type: "tendermint/PubKeyMultisigThreshold",
      value: {
        pubkeys: [signer.publicKey],
        threshold: "1",
      },
    };
  });

  // test("Cosmos", async () => {
  //   const sdk = Sdk.chainId("juno-1");
  //   const address = sdk.transactions.getAddressOfPublicKey(multisigPublicKey);
  //   const message = new MsgSend(address, address, { uscrt: 1 });
  //   const multisigSigner = await sdk.transactions.createMultisigSigner({
  //     multisigPublicKey,
  //     messages: [message],
  //   });
  //   expect(multisigSigner.enoughSignatures).toEqual(false);
  //   expect(multisigSigner.alreadySigned(signer.publicKey)).toEqual(false);
  //   expect(() => {
  //     multisigSigner.createSignedTransactionOrMessage();
  //   }).toThrowErrorMatchingSnapshot();
  //   await multisigSigner.addSigner(signer);
  //   expect(multisigSigner.enoughSignatures).toEqual(true);
  //   expect(multisigSigner.alreadySigned(signer.publicKey)).toEqual(true);
  //   const signedTransaction = multisigSigner.createSignedTransactionOrMessage();
  //   expect(signedTransaction).toBeInstanceOf(Uint8Array);
  // });

  // test("Terra", async () => {
  //   const sdk = Sdk.chainId("phoenix-1");
  //   const address = sdk.transactions.getAddressOfPublicKey(multisigPublicKey);
  //   const message = new MsgSend(address, address, { uscrt: 1 });
  //   const multisigSigner = await sdk.transactions.createMultisigSigner({
  //     multisigPublicKey,
  //     messages: [message],
  //   });
  //   expect(multisigSigner.enoughSignatures).toEqual(false);
  //   expect(multisigSigner.alreadySigned(signer.publicKey)).toEqual(false);
  //   expect(() => {
  //     multisigSigner.createSignedTransactionOrMessage();
  //   }).toThrowErrorMatchingSnapshot();
  //   await multisigSigner.addSigner(signer);
  //   expect(multisigSigner.enoughSignatures).toEqual(true);
  //   expect(multisigSigner.alreadySigned(signer.publicKey)).toEqual(true);
  //   const signedTransaction = multisigSigner.createSignedTransactionOrMessage();
  //   expect(signedTransaction).toBeInstanceOf(Uint8Array);
  // });
});
