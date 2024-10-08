import { urlDecodeCatchAllParam } from "@/util/url-decode-catch-all-param";

test("local", () => {
  const param = [
    "cosmos%3Apacific-1%2Fibc%3AF082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
  ];
  expect(urlDecodeCatchAllParam(param)).toEqual(
    "cosmos:pacific-1/ibc:F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
  );
});

test("Vercel", () => {
  // see https://github.com/vercel/next.js/issues/24775
  const param = [
    "cosmos%3Apacific-1",
    "ibc%3AF082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
  ];
  expect(urlDecodeCatchAllParam(param)).toEqual(
    "cosmos:pacific-1/ibc:F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349",
  );
});
