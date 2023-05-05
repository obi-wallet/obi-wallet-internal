import { Chain, ChainId } from "../src";

test("Chain.select", () => {
  const f = (chainId: ChainId) => {
    return Chain.select({
      chainId,
      onLegacyCosmosChain: () => "onCosmosChain",
      onTerraChain: () => "onTerraChain",
    });
  };

  expect(f("uni-3")).toEqual("onCosmosChain");
  expect(f("juno-1")).toEqual("onCosmosChain");
  expect(f("pisco-1")).toEqual("onTerraChain");
  expect(f("phoenix-1")).toEqual("onTerraChain");
});
