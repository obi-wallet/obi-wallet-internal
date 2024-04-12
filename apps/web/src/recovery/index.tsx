"use client";

import { PrimaryKeyStep } from "@/recovery/step/primary-key";
import { observer } from "mobx-react-lite";

export const Recovery = observer(function Recovery() {
  return (
    <section className="flex flex-col items-center space-y-7 px-5">
      <PrimaryKeyStep />
    </section>
  );
});
