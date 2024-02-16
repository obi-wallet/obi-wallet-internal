"use client";

import { useEffectOnceWhen } from "rooks";

// @refresh reset
export default function DebugPage() {
  useEffectOnceWhen(async () => {
    /* eslint-disable import/no-extraneous-dependencies */
    const [_chai, mocha] = await Promise.all([
      import("chai"),
      // @ts-expect-error Ignore
      import("mocha/mocha.js"),
      // @ts-expect-error Ignore
      import("mocha/mocha.css"),
    ]);
    /* eslint-enable import/no-extraneous-dependencies */
    mocha.setup("tdd");
    mocha.checkLeaks();

    suite("Suite", async function () {
      test("Test", async function (this: { timeout(ms: number): void }) {
        this.timeout(0);
      });
    });

    mocha.run();
  });

  return <div id="mocha" className="text-white" />;
}
