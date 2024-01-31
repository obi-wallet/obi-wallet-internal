"use client";

import { distributeShares } from "@/lib/mpc";
import { useEffectOnceWhen } from "rooks";

// @refresh reset
export default function DebugPage() {
  useEffectOnceWhen(async () => {
    const [_chai, mocha] = await Promise.all([
      import("chai"),
      import("mocha/mocha.js"),
      import("mocha/mocha.css"),
    ]);
    mocha.setup("tdd");
    mocha.checkLeaks();

    suite("distributeShares", function () {
      test("should succeed", async function () {
        this.timeout(0);
        await distributeShares();
      });
    });

    mocha.run();
  });

  return <div id="mocha" className="text-white" />;
}
