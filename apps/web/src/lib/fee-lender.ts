import { Encoding } from "@obi-wallet/encoding";
import {
  Secp256k1PrivateKeySigner,
  SecretJsHomeChainId,
} from "@obi-wallet/sdk";
import { deserialize } from "@obi-wallet/sdk-json";
import { Wallet } from "secretjs";
import invariant from "tiny-invariant";

export function getFeeLender(
  chainId: SecretJsHomeChainId,
  knownLenderIndex?: number,
) {
  invariant(chainId, "Unknown chain ID");
  switch (chainId) {
    case SecretJsHomeChainId.PULSAR_TESTNET: {
      invariant(process.env.FEE_LENDERS_PULSAR_3, "No fee lenders");
      const feeLenders = deserialize(process.env.FEE_LENDERS_PULSAR_3);
      const lenderIndex =
        knownLenderIndex ?? Math.floor(Math.random() * feeLenders.length);
      const feeLender = feeLenders[lenderIndex];
      const wallet = new Wallet(feeLender);
      const signer = new Secp256k1PrivateKeySigner(
        Encoding.fromBytes(wallet.privateKey).toBase64(),
      );
      return { wallet, signer, lenderIndex };
    }
    case SecretJsHomeChainId.MAINNET: {
      invariant(process.env.FEE_LENDER_SECRET_4, "No fee lenders");
      const feeLender = process.env.FEE_LENDER_SECRET_4;
      const lenderIndex = knownLenderIndex ?? Math.floor(Math.random() * 1000);
      const wallet = new Wallet(feeLender, {
        hdAccountIndex: lenderIndex,
      });
      const signer = new Secp256k1PrivateKeySigner(
        Encoding.fromBytes(wallet.privateKey).toBase64(),
      );
      return { wallet, signer, lenderIndex };
    }
  }
}
