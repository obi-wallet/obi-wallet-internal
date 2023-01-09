import { LCDClient, Coin } from "@terra-money/terra.js";
import { useEffect } from "react";

export default () => {
  useEffect(() => {
    const terra = new LCDClient({
      URL: "https://pisco-lcd.terra.dev",
      chainID: "pisco-1",
    });
    console.log("hey");
  });
  return null;
};
