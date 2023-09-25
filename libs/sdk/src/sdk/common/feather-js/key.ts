// import { Key as AbstractKey, SimplePublicKey } from "@terra-money/feather.js";

// import { Signer } from "../../../signers";

// export class FeatherJsKey extends AbstractKey {
//   protected constructor(protected signer: Signer) {
//     super(SimplePublicKey.fromAmino(signer.publicKey));
//   }

//   public async sign(payload: Buffer) {
//     return this.signer.sign(payload);
//   }

//   public static fromSigner(signer: Signer) {
//     return new FeatherJsKey(signer);
//   }
// }
