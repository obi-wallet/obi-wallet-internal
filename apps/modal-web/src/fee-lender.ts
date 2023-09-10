import { Secp256k1PrivateKeySigner, SecretJsChainId } from "@obi-wallet/sdk";
import { Wallet } from "secretjs";

export function getFeeLender(chainId: SecretJsChainId) {
  switch (chainId) {
    case "pulsar-3": {
      const feeLender = process.env.FEE_LENDER_PULSAR_3 ?? "";
      const feeLenderIndex = Math.floor(Math.random() * 10);
      const wallet = new Wallet(feeLender, {
        hdAccountIndex: feeLenderIndex,
      });

      const signer = new Secp256k1PrivateKeySigner(
        Buffer.from(wallet.privateKey).toString("base64"),
      );
      return { wallet, signer };
    }
    case "secret-4": {
      const feeLender = process.env.FEE_LENDER_SECRET_4 ?? "";
      const feeLenderIndex = Math.floor(Math.random() * 1000);
      const wallet = new Wallet(feeLender, {
        hdAccountIndex: feeLenderIndex,
      });
      const signer = new Secp256k1PrivateKeySigner(
        Buffer.from(wallet.privateKey).toString("base64"),
      );
      return { wallet, signer };
    }
  }

  throw new Error("Unknown chain ID");
}
