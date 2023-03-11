import { Chain } from "../src";

test("Chain.select", () => {
  const f = (chainId: Chain) => {
    return Chain.select({
      chainId,
      onCosmosChain: () => "onCosmosChain",
      onTerraChain: () => "onTerraChain",
    });
  };

  expect(f("uni-3")).toEqual("onCosmosChain");
  expect(f("juno-1")).toEqual("onCosmosChain");
  expect(f("pisco-1")).toEqual("onTerraChain");
  expect(f("phoenix-1")).toEqual("onTerraChain");
});
