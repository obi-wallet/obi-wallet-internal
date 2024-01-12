import { Secp256k1PrivateKeySigner, SecretJsChainId } from "@obi-wallet/sdk";
import { Wallet } from "secretjs";
import invariant from "tiny-invariant";

export function getFeeLender(
  chainId: SecretJsChainId,
  knownLenderIndex?: number,
) {
  // TODO: add env vars for fee lenders
  invariant(chainId, "Unknown chain ID");
  switch (chainId) {
    case "pulsar-3": {
      const feeLenders = JSON.parse(process.env.FEE_LENDERS_PULSAR_3 ?? "[]");
      const feeLender =
        feeLenders[Math.floor(Math.random() * feeLenders.length)];
      const wallet = new Wallet(feeLender);
      const signer = new Secp256k1PrivateKeySigner(
        Buffer.from(wallet.privateKey).toString("base64"),
      );
      return { wallet, signer };
    }
    case "secret-4": {
      const feeLender = process.env.FEE_LENDER_SECRET_4 ?? "";
      console.log("knownLenderIndex is " + knownLenderIndex);
      const lenderIndex = knownLenderIndex ?? Math.floor(Math.random() * 1000);
      const wallet = new Wallet(feeLender, {
        hdAccountIndex: lenderIndex,
      });
      const signer = new Secp256k1PrivateKeySigner(
        Buffer.from(wallet.privateKey).toString("base64"),
      );
      // we need to return the lender index since it owns the account
      // before owner is known and first_update_owner is called on it
      return { wallet, signer, lenderIndex };
    }
  }
}
