import { Eip1193Provider } from "ethers";
import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum: BrowserProvider & Eip1193Provider;
  }
}
