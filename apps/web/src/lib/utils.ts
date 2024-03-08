import { CosmosSdkChains } from "@/target-chain/cosmos-sdk/chains";
import { EthUserOp, RustEthUserOp } from "@obi-wallet/mpc-ecdsa-wasm-types";
import clsx, { ClassValue } from "clsx";
import { ec } from "elliptic";
import { ethers } from "ethers";
import { PubKey } from "secretjs";
import { twMerge } from "tailwind-merge";

/** Merge classes with tailwind-merge with clsx full feature */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return window.btoa(binary);
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function decompressPoint(compressedPointHex: string): string {
  // Decode the compressed point to get an elliptic curve point
  const secp256k1 = new ec("secp256k1");
  const point = secp256k1.curve.decodePoint(compressedPointHex, "hex");

  // Retrieve the uncompressed x and y coordinates
  const x = point.getX().toString(16).padStart(64, "0");
  const y = point.getY().toString(16).padStart(64, "0");

  // Create the uncompressed hex string
  return x + y;
}

export function createUserOperationHash(
  ethUserOp: EthUserOp,
  entryPointAddr: string,
  chainId: string,
): string {
  const getUserOpHash = (): string => {
    const packed = ethers.AbiCoder.defaultAbiCoder().encode(
      [
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "bytes32",
      ],
      [
        ethUserOp.sender,
        ethUserOp.nonce,
        ethers.keccak256(ethUserOp.initCode),
        ethers.keccak256(ethUserOp.callData),
        ethUserOp.callGasLimit,
        ethUserOp.verificationGasLimit,
        ethUserOp.preVerificationGas,
        ethUserOp.maxFeePerGas,
        ethUserOp.maxPriorityFeePerGas,
        ethers.keccak256(ethUserOp.paymasterAndData),
      ],
    );

    const enc = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "address", "uint256"],
      [ethers.keccak256(packed), entryPointAddr, chainId],
    );

    return ethers.keccak256(enc);
  };

  return getUserOpHash();
}

export function transformEthUserOp(ethUserOp: EthUserOp): RustEthUserOp {
  function hexToNumberArray(hexString: string): number[] {
    return Array.from(new Uint8Array(Buffer.from(hexString.slice(2), "hex")));
  }

  return {
    sender: ethUserOp.sender.toLowerCase().startsWith("0x")
      ? ethUserOp.sender.slice(2)
      : ethUserOp.sender,
    nonce: parseInt(ethUserOp.nonce, 16).toString(10),
    init_code: hexToNumberArray(ethUserOp.initCode),
    call_data: hexToNumberArray(ethUserOp.callData),
    call_gas_limit: parseInt(ethUserOp.callGasLimit, 16).toString(10),
    verification_gas_limit: parseInt(
      ethUserOp.verificationGasLimit,
      16,
    ).toString(10),
    pre_verification_gas: parseInt(ethUserOp.preVerificationGas, 16).toString(
      10,
    ),
    max_fee_per_gas: parseInt(ethUserOp.maxFeePerGas, 16).toString(10),
    max_priority_fee_per_gas: parseInt(
      ethUserOp.maxPriorityFeePerGas,
      16,
    ).toString(10), // Fixed this line
    paymaster_and_data: hexToNumberArray(ethUserOp.paymasterAndData),
    signature: [],
  };
}

export function encodeSecp256k1Pubkey(pubkey: Uint8Array): PubKey {
  if (pubkey.length !== 33 || (pubkey[0] !== 0x02 && pubkey[0] !== 0x03)) {
    throw new Error(
      "Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03",
    );
  }
  return {
    type: "tendermint/PubKeySecp256k1",
    value: Buffer.from(pubkey).toString("base64"),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function utf8ArrayToObject(data: Uint8Array): any {
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(data));
}
export function getToChain(chainId: string) {
  return CosmosSdkChains[chainId as keyof typeof CosmosSdkChains];
}
export function getFromChain(chainId: string) {
  return fromChains.find((c) => c.chainId === chainId);
}
export const fromChains = [
  {
    chainId: "42161",
    label: "Arbitrum",
    image:
      "https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg?1696516109",
  },
  {
    chainId: "8453",
    label: "Base",
    image:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABklBMVEUAAAAAVf8AUv8AUv8AUv8AUv8AU/8AUv8AUv8AUv8AUv8AU/8ATv8AVf8AUv8AUv8AU/8AVf8AUf8AUv8AUf8ASf8AUP8AUv8AUv8AT/8AU/8AUv8AUv8AU/8AUP8AUv8AYP8AU/8AUv8AUv8AUv8AVf8AUv8AUv8AXf8AUf8AU/8AUf8AUv8AUv8AUv8AUv8AUv8AUv8AUv8AU/8AUv8AUv8AUv8AU/8AUf8AUv8AUv8AUf8AUf8AUv8AVf8AU/8AUv8AU/8AUv8AVf8AUv8AUv8AUf8AUv8AUv8FVf8iaf86ef84eP8cZf8EVf8BU/9Tiv+uyP/z9//////v9P+lwv9JhP/R4P/B1f8ucf9pmf/5+//0+P9ll//+/v9WjP/8/f8rb//Q3/+/1P9Df/+50P+dvf/4+v/q8f8scP8TX/8RXv+Ttv8SXv/p8P+4z/+bu/9Cf//P3v++0/85ef/7/P8qbv9klv/9/v9QiP9nmP9Siv82d//O3v9Rif+tx//y9v/u8/+jwf9Hgv8gaP8bZP8uOY56AAAASHRSTlMACVGWw+nu/OTElVANHvOSIgaH+YEHI87RHSvm5S4g6wjM0IaAIfeZC/FWT8nj9vDnwJiUV/gciITN6C8pyySa9JcfDMjHkFR31d0YAAAAAWJLR0RTemcdBgAAAAlwSFlzAAAdhwAAHYcBj+XxZQAAAAd0SU1FB+cIBwwjJOGCmDYAAAGTSURBVDjLfVNXW8JAEDxElI4Ywa4IglgARRTF3lEQkLMXEDv23nv532YvCaTpPOTuZuZLNnuzCOWgKFAWqoqK1RqtTo+kMCiN4RyMphKRbC6lwgJQZRa+bi0PS1BRmderqllyeiYSnY2xh5paTq+rJ0Q8MZfENOYXFlkH+w5bAzlGl3AOyyuEsjN1OMhhdQ3zsJ4gZCPoThdsN7AQqTT5FyttaIJdZFNkwMkM8CaE3M30GtvCEmyTjulRC6xpLIMdUFqRCZZdOcMeKFrUBv3ZlzMcxGlJg9T0M4tlcUhLHuSFGo9EOCYG6JYXUf8bfAjuISP/iRNaav+nyFMosgP54WfO5AznoHSiwJ+NugBFh9wQxdilVL8irVawl3V9I7msW+CVkEcS17uUUL9/ALarGwIRJNl4FAQm+UTIHpIoCxPp5xfeVWcJ1WtmQx9iQvv69g7qx+cXE1q1k4t1X4iL/Xck+sPFPtTPGxy7dHAGDPzRsgVFo+dy2ETTOTg0nJd9I6My8z0W8I+rKK9nYnJKkWd/ARPt9/xvuhVMAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA4LTA3VDEyOjM1OjM2KzAwOjAwrnvl4wAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wOC0wN1QxMjozNTozNiswMDowMN8mXV8AAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAV3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHic4/IMCHFWKCjKT8vMSeVSAAMjCy5jCxMjE0uTFAMTIESANMNkAyOzVCDL2NTIxMzEHMQHy4BIoEouAOoXEXTyQjWVAAAAAElFTkSuQmCC",
  },
  {
    chainId: "1",
    label: "Ethereum",
    image:
      "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
    disabled: true,
  },
];

export const toChains = ["pacific-1", "stargaze-1", "osmosis-1", "neutron-1"];
