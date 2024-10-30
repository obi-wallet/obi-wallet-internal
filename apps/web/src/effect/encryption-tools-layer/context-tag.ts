import { Context } from "effect";

import { EncryptionTools as IEncryptionTools } from "./encryption-tools";

export class EncryptionTools extends Context.Tag("EncryptionTools")<
  EncryptionTools,
  IEncryptionTools
>() {}
