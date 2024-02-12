"use client";

import { Button } from "@/components";
import { useStore } from "@/contexts";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export default observer(function Pair() {
  const { walletConnectStore } = useStore();
  const [uri, setUri] = useState("");

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
