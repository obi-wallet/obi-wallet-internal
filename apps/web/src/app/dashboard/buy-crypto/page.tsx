"use client";

import { useAddresses } from "@/hooks/use-addresses";
import { usePublicKey } from "@/hooks/use-public-key";
import { observer } from "mobx-react-lite";

export default observer(function BuyCrypto() {
  const publicKey = usePublicKey();
  const addresses = useAddresses({ publicKey });
  const addressesString = addresses.reduce((prev, curr, index) => {
    return (
      prev +
      curr.chain +
      ":" +
      curr.address +
      (index === addresses.length - 1 ? "" : ",")
    );
  }, "");

  return (
    <div className="h-full w-full">
      <iframe
        src={`https://app.kado.money?apiKey=0a5fc82b-be15-4059-8edf-9ff9c54186ce&onPayCurrency=USD&onRevCurrency=SEI&onPayAmount=100&&onToAddressMulti=${addressesString}&cryptoList=OSMO,ATOM,STARS,SCRT,INJ,NTRN,SEI,TIA&fiatList=USD,CAD&network=sei&product=BUY&productList=BUYnetworkList=OSMOSIS,STARGAZE,SEI,NEUTRON`}
        className=" h-full w-[500px] max-md:w-full"
      ></iframe>
    </div>
  );
});
