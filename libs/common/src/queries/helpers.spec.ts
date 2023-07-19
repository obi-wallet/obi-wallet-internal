import { staleTime } from "./helpers";

test("staleTime", () => {
  expect(staleTime({ days: 1 })).toEqual(1000 * 60 * 60 * 24);
  expect(staleTime({ days: 1, seconds: 1 })).toEqual(
    1000 * 60 * 60 * 24 + 1000,
  );
});
