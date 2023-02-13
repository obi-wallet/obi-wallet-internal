import { fetchMeta } from "./fetch-meta";

test("Osmosis", async () => {
  const meta = await fetchMeta("https://osmosis.zone");
  expect(meta.title).toEqual("Osmosis");
  // For some reason, this fails without the log...
  console.log(meta.icon);
  expectIconToBePng(meta.icon);
});

/* test("Kado", async () => {
  const meta = await fetchMeta("https://kado.money");
  expect(meta.title).toEqual("Buy and Sell Crypto Assets Instantly with Kado");
  expectIconToBePng(meta.icon);
}); */

function expectIconToBePng(icon: string | null) {
  expect(icon?.startsWith("https://")).toEqual(true);
  expect(icon?.endsWith(".png")).toEqual(true);
}
