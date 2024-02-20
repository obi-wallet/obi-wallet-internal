"use client";

import { PrimaryKeyStep } from "@/recovery/step/primary-key";
import { useRecoveryDraft } from "@/recovery/use-recovery-draft";
import { observer } from "mobx-react-lite";

export const Recovery = observer(function Recovery() {
  const draft = useRecoveryDraft();

  if (!draft) return null;

  return (
    <section className="flex flex-col items-center space-y-7 px-5">
      <PrimaryKeyStep draft={draft} />
    </section>
  );
});
