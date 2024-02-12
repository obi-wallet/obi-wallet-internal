"use client";

import { Button } from "@/components";
import { useStore } from "@/contexts";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export default observer<{ params: { pair?: string[] } }>(function Pair() {
  const { walletConnectStore } = useStore();
  const [uri, setUri] = useState(
    "wc:5f3a6ea5ba2337c3d4fd443f4ebb27032fa798c94271d77134d9f8047846adb1@2?relay-protocol=irn&symKey=b033a68f5992e61f1f223fd2950f94a3a4d60d3d282e8658c9d6c9907f72f983",
  );

  return (
    <div className="pt-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void walletConnectStore.pair(uri);
        }}
      >
        <Input
          value={uri}
          onChange={setUri}
          label="Pairing URL"
          labelClassname="bg-black"
        />
        <Button type="submit">Scan</Button>
      </form>
    </div>
  );
});
