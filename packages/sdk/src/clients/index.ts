// TODO: Without this (unused) import, ESLint has a heap overflow.
// There is probably some kind of dependency cycle involving the classes
// (e.g., something using the Signer classes is loaded before the Signer classes itself or something0
import { Signer as _Signer } from "../signers";
export * from "./secret-js";
